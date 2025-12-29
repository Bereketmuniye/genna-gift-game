import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TabTwoScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>About Genna</Text>
        <Text style={styles.text}>
          Genna is the Ethiopian Christmas, celebrated on January 7th. It is a time of joy, family gatherings, and traditional games.
        </Text>
        <Text style={styles.text}>
          One of the most famous traditions is the game of "Genna", a field hockey-like game played with curved sticks and a wooden ball.
        </Text>
        <Text style={styles.text}>
          In this app, we celebrate the spirit of giving with a "Gift Drop" game. Catch as many gifts as you can!
        </Text>
        <Text style={styles.footer}>Melkam Genna! (Merry Christmas!)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 20,
    color: '#ef4444', // Brighter Red
  },
  text: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 15,
    color: '#334155', // Dark Slate
  },
  footer: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 30,
    color: '#16a34a', // Darker Green for white bg
    textAlign: 'center',
  },
});
