import { StyleSheet, Text, TouchableOpacity, Alert } from "react-native";
import { addFeeding } from '@/api/feeding';

export default function FeedingButton() {
  const feedSami = async() => {
    try{
      await addFeeding("Fed one pack");
      Alert.alert("Success")
    }
    catch (err) {
      console.error(err);
      Alert.alert("Error", "Issue logging Sami's feeding")
    }
  }
  
    return(
        <TouchableOpacity style={styles.button} onPress={feedSami}>
      <Text style={styles.text}>I Fed Sami</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
    backgroundColor: "#1E90FF", 
    width: 100,                  
    height: 100,                 
    borderRadius: 50,            
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    shadowColor: "#000",         
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,                
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
})