import { Text, View } from 'react-native'
import React , { useState, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

import { viewData } from '../components/Database';

const Flashcard = () => {
  const [words, setWords] = useState([]);

  const fetchWords = () => {
    viewData()
      .then(data => {
        setWords(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };
  useEffect(() => {
    fetchWords();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchWords(); // Fetch data whenever screen is focused
    }, [])
  );
  
  console.log("words in vocab", words);
 
  const showWords = () => {
    return words.map((word, index) => {
      return (
        <View key={index}>
          {word.word && <Text>Word: {word.word}</Text>}
          {word.definition && <Text>Definition: {word.definition}</Text>}
          {word.hanja && <Text>Hanja: {word.hanja}</Text>}
          {word.kor_level && <Text>Korean Level: {word.kor_level}</Text>}
        </View>
      )
    })
  }

  return (
    <View>
      {showWords()}
    </View>
  )
};  

export default Flashcard