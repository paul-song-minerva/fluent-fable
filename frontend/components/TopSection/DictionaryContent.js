import React, { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
// API and libraries
import koreanDictionary from '../api/koreanDictionary';
import stemWord from '../api/stemWord';
// icons for UI
import { AntDesign } from '@expo/vector-icons';
// database and context
import { insertData, removeData } from '../Database'; // import database

// Dictionary Component
const DictionaryContent = ({ highlightedWord }) => {
    // handles 'more' and 'less' to control how much info is displayed from dictionary def
    const [expandedWords, setExpandedWords] = useState([]);
    const [savedWords, setSavedWords] = useState({});

    // call the APIs for stemming and definition lookup
    const stemWordList  = stemWord({ query: highlightedWord });
    const { dictionaryData } = koreanDictionary({ query: stemWordList });

    // user input: logic to show more definitions if user wants
    const toggleExpanded = (word) => {
        setExpandedWords((prevExpandedWords) =>
            prevExpandedWords.includes(word) ? prevExpandedWords.filter((w) => w !== word) : [...prevExpandedWords, word]
        );
    };

    // add word to database and toggle save
    const toggleSave = async (word, origin, definition) => {
        const updatedSavedWords = { ...savedWords, [(word, origin, definition)]: true };
        setSavedWords(updatedSavedWords);
        insertData(word, origin, definition, "unorganized");
    };

    // remove word from database and toggle unsave
    const toggleUnSave = async (word, origin, definition) => {
        const updatedSavedWords = { ...savedWords };
        delete updatedSavedWords[(word, origin, definition)];
        setSavedWords(updatedSavedWords);
        removeData(word, origin, definition);
    }

    // check if a word is already saved in the database
    const isWordSaved = (word, origin, definition) => savedWords[(word, origin, definition)] === true;

    // handle the modal for hanja search
    const [currentHanja, setCurrentHanja] = useState(null);
    const handleHanjaPress = (hanja) => {
        setCurrentHanja(hanja);
    };

    return (
        <ScrollView style={{ marginTop: 30, marginLeft: 0 }}>
            {stemWordList.map((word, index) => (
                <View key={index}>
                    {dictionaryData[index] && dictionaryData[index].length > 0 ? (
                        <>
                        {/* this shows the first entry of the dictionary definition */}
                        <View>

                            <TouchableOpacity onPress={() => isWordSaved(word, dictionaryData[index][0].origin, dictionaryData[index][0].transWord) 
                                ? toggleUnSave(word, dictionaryData[index][0].origin, dictionaryData[index][0].transWord) 
                                : toggleSave(word, dictionaryData[index][0].origin, dictionaryData[index][0].transWord)} 
                                style={styles.save}>
                                <AntDesign name={isWordSaved(word, dictionaryData[index][0].origin, dictionaryData[index][0].transWord) 
                                    ? "checksquare" : "checksquareo"} size={15} color="black" />
                            </TouchableOpacity>

                            <View style={styles.content}>
                                <Text style={{ fontWeight: 'bold' }}>{word}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ marginHorizontal: 5 }}>(</Text>

                                    {dictionaryData[index][0].origin.split('').map((hanja, index) => {
                                        return(
                                            <TouchableOpacity key={index} onPress={() => handleHanjaPress(hanja)}>
                                                <Text>{hanja}</Text>
                                            </TouchableOpacity>
                                        )
                                    })}

                                    <Text style={{ marginHorizontal: 5 }}>)</Text>
                                    <Text>{dictionaryData[index][0].transWord}</Text>
                                </View>
                                {dictionaryData[index].length > 1 ? (
                                    <TouchableOpacity onPress={() => toggleExpanded(word)}>
                                        <Text style={{ color: 'blue', textDecorationLine: 'underline', marginLeft: 5}}>
                                            {expandedWords.includes(word) ? 'less' : 'more'}
                                        </Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>

                        </View>
                        {/* shows the rest of the definitions once 'more' is pressed */}
                        {expandedWords.includes(word) &&
                            dictionaryData[index].slice(1).map((entry, i) => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>

                                    <TouchableOpacity onPress={() => isWordSaved(entry.word, entry.origin, entry.transWord) 
                                        ? toggleUnSave(entry.word, entry.origin, entry.transWord) 
                                        : toggleSave(entry.word, entry.origin, entry.transWord)} style={styles.save}>
                                        <AntDesign name={isWordSaved(entry.word, entry.origin, entry.transWord) 
                                            ? "checksquare" : "checksquareo"} size={15} color="black" style={{ opacity: 0.5 }}/>
                                    </TouchableOpacity>

                                    <View style={styles.content}>
                                        <Text>{entry.word}</Text>
                                        <Text style={{ marginHorizontal: 5 }}>(</Text>

                                        {entry.origin.split('').map((hanja, index) => {
                                            return(
                                                <TouchableOpacity key={index} onPress={() => handleHanjaPress(hanja)}>
                                                    <Text>{hanja}</Text>
                                                </TouchableOpacity>
                                            )
                                        })}
                                            <Text style={{ marginHorizontal: 5 }}>)</Text>
                                            <Text>{entry.transWord}</Text>
                                        </View>
                                    </View>
                                ))}
                            </>
                        ) : (
                            <Text> "Loading..." </Text>
                        )}
                    </View>
                ))}

            {/* Modal to display selected Hanja */}
            <Modal visible={currentHanja !== null} animationType="fade" transparent={true}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity style={styles.cancel} onPress={() => setCurrentHanja(null)}></TouchableOpacity>
                    <View style={styles.modalContent}>
                        <Text>{currentHanja}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setCurrentHanja(null)}></TouchableOpacity>
                </View>
            </Modal>
        </ScrollView>
    )
};

const styles = StyleSheet.create({
    save: {
        position: 'absolute', // Set position to absolute
        top: 3, // Adjust top position as needed
        left: 5, // Adjust right position as needed
        borderRadius: 5, // Example border radius
        justifyContent: 'center', // Center content vertically
        alignItems: 'center', // Center content horizontally
    },
    content: {
        left: 25,
        flexDirection: 'row'    
    },
    modalContent: {
        position: 'absolute',
        width: "90%",
        height: "65%",
        top: 220,
        backgroundColor: 'white', 
        padding: 10,
        borderRadius: 10,

        justifyContent: 'center',
        alignItems: 'center'
    },
    cancel: {
        position: 'absolute',
        width: "100%",
        height: "100%",
        backgroundColor: 'rgba(168, 162, 158, 0.5)', 
        opacity: '100%',
        padding: 10,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default DictionaryContent