import React from "react"
import{Text,TouchableOpacity,View,StyleSheet,Image,TextInput, Alert,keyboardAvoidingView, KeyboardAvoidingView,ToastAndroid} from "react-native"
import * as Permissions from "expo-permissions"
import{BarCodeScanner} from "expo-barcode-scanner"
import db from "../Config"
export default class Transactionscreen extends React.Component{
    constructor(){
    super();
    this.state={
        hascamerapermission:null,
        scanned:false,
        scandata:"",
        Buttonstate:"normal",
        scannedbookid:"",
        scannedstudentid:"",
        transactionmessage:"",
    }
    }
    Handledtransaction=async ()=>{
    var transactiontype=await this.checkbookeligibility();
      if(! transactiontype){
        Alert.alert("the book doen't exist in the database")
        this.setState({scannedstudentid:"",scannedbookid:""})
      }
      else if(transactiontype ==="issue"){
        var isstudenteligibile=await this.checkstudenteligiblityforbookissued();
        if(isstudenteligible){
            this.Initiatebookissue();
            Alert.alert ("bookissuedtothestudent")
        }
      }
      else{
          var isstudenteligibile=await this.checkstudenteligiblityforbookreturned();
            if(isstudenteligible){
              this.Initiatebookreturn();
                Alert.alert ("bookreturnedtothelibrary")
            }
      }
    }
    checkbookeligibility=async()=>{
      const bookref=await db.collection("Books").where ("bookid", "==",this.state.scannedbookid).get()
        var transactiontype=""
          if(bookref.docs.length == 0){
            transactiontype= false;
          }
          else{
            bookref.docs.map(doc=>{
              var book=doc.data();
              if(book.Bookavailablity){
                transactiontype="issue";
              }
              else{
                transactiontype="return"
              }
            })
          }
          return transactiontype;
    }
    checkstudenteligiblityforbookissued=async()=>{
      const studentref=await db.collection("Students").where ("Studentid", "==", this.state.scannedstudentid).get();
      var isstudenteligibile=""
      if(studentref.docs.length == 0){
        this.setState({scannedstudentid:"", scannedbookid:""})
      isstudenteligibile=false;
      Alert.alert("Studentid doesn't exist in database")
      }
      else{
        studentref.docs.map(doc=>{
          var student=doc.data();
          if(student.Nomberofbooksissued<2){
            isstudenteligibile=true
          }
          else{
            isstudenteligibile=false;
            Alert.alert("Student has already issued 2 books")
            this.setState({scannedstudentid:"", scannedbookid:""})
          }
        })
      }
      return isstudenteligibile
    }
    checkstudenteligiblityforbookreturned=async()=>{
      const transactionref=await db.collection("transactions").where ("bookid","==", this.state.scannedbookid).limit(1).get();
      var isstudenteligibile="";
      transactionref.docs.map(doc=>{
        var lastbooktransaction=doc.data();
        if(lastbooktransaction.Studentid === this.state.scannedstudentid){
          isstudenteligibile=true;
        }
        else{
          isstudenteligibile=false;
          Alert.alert("The book wasn't issued by the student")
          this.setState({scannedstudentid:"",scannedbookid:""})
        }
      })
      return isstudenteligible
    }
    
    Initiatebookissue=async()=>{
      db.collection("transactions").add({
        Studentid:this.state.scannedstudentid,
        bookid:this.state.scannedbookid,
        Date:firebase.firestore.Timestamp.now().toDate(),
        transactiontype:"issue",
      })
      db.collection("Books").doc(this.state.scannedbookid).update({
        Bookavailablity:false
      })
      db.collection("Students").doc(this.state.scannedstudentid).update({
        Nomberofbooksissued:firebase.firestore.FieldValue.increment(1)
      })
      Alert.alert("bookissued")
      this.setState({
        scannedbookid:"",
        scannedstudentid:""
      })
    } 
    Initiatebookreturn=async()=>{
      db.collection("transactions").add({
        Studentid:this.state.scannedstudentid,
        bookid:this.state.scannedbookid,
        Date:firebase.firestore.Timestamp.now().toDate(),
        transactiontype:"return",
      })
      db.collection("Books").doc(this.state.scannedbookid).update({
        Bookavailablity:true
      })
      db.collection("Students").doc(this.state.scannedstudentid).update({
        Nomberofbooksissued:firebase.firestore.FieldValue.incriment(-1)
      })
      Alert.alert("bookreturned")
      this.setState({
        scannedbookid:"",
        scannedstudentid:""
      })
    }

getcamerapermissions=async(id)=>{
    const {status}=await Permissions.askAsync (Permissions.CAMERA)
    this.setState({
    hascamerapermission:status==="granted",
Buttonstate:id,
scanned:false
    })
}
handleBarcodeScan= async({type,data})=>{
  const { ButtonState } = this.state;

  if (ButtonState === "bookid") {
    this.setState({
      scanned: true,
      scannedbookid: data,
      ButtonState: "normal"
    });
  } else if (ButtonState === "Studentid") {
    this.setState({
      scanned: true,
      scannedstudentid: data,
      ButtonState: "normal"
    });
  }
}

    render(){
        const hascamerapermission= this.state.hascamerapermission;
        const scanned=this.state.scanned;
        const Buttonstate=this.state.Buttonstate
        if(Buttonstate!=="normal" && hascamerapermission){
            return(
                <BarCodeScanner 
                onBarCodeScanned= {scanned ? undefined :this.handleBarcodeScan}
                style={StyleSheet.absoluteFillObject} />
            )
        }
        else if(Buttonstate==="normal"){
        return(
          <KeyboardAvoidingView style={styles.container} behaviour ="padding" enabled>
           
<View><Image source={require("../assets/booklogo.jpg")}
style={{width:200,height:200}}/>
<Text>Wireless Library</Text>
</View>
<View style= {styles.inputView}>
    <TextInput style={styles.inputBox}
    placeholder= "bookid"
    onChangeText={text=>this.setState({scannedstudentid:text})}
    value={this.state.scannedbookid}/>
    <TouchableOpacity onPress={()=>{
        this.getcamerapermissions("bookid")
    }}><Text>Scan</Text></TouchableOpacity>
</View>
<View style= {styles.inputView}>
    <TextInput style={styles.inputBox}
    placeholder= "studentid"
    onChangeText={text=>this.setState({scannedstudentid:text})}
    value={this.state.scannedstudentid}/>
      <TouchableOpacity onPress={()=>{
          this.getcamerapermissions("Studentid")
      }}><Text>Scan</Text></TouchableOpacity>
</View>
                <Text style={styles.transactionAlert}>{this.state.transactionmessage}</Text>
               
                <TouchableOpacity style={styles.submitButton} onPress={
                    async()=>{
                        var trannsactionmessage=await this.Handledtransaction();
                        this.setState({scannedbookid:"", scannedstudentid:""})
                    }
                }><Text style={styles.submitButtonText}>Submit</Text></TouchableOpacity>
           </KeyboardAvoidingView>
        )}
    }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
      backgroundColor: '#FBC02D',
      width: 100,
      height:50
    },
    submitButtonText:{
      padding: 10,
      textAlign: 'center',
      fontSize: 20,
      fontWeight:"bold",
      color: 'white'
    }
  });