import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Image } from 'react-native';
import * as Location from 'expo-location';

const API_KEY = '985da39d6270872630a22f14f07ac994'; // OpenWeatherMap API key
const WEATHER_API = 'https://api.openweathermap.org/data/2.5/weather';
const AIR_QUALITY_API = 'https://api.openweathermap.org/data/2.5/air_pollution';

const WeatherScreen = () => {
  const [locationError, setLocationError] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [unitPreference, setUnitPreference] = useState('metric');

  useEffect(() => {
    const fetchWeatherAndAirQuality = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Location permission denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync();
        const { latitude, longitude } = location.coords;

        const weatherResponse = await fetch(
          `${WEATHER_API}?lat=${latitude}&lon=${longitude}&units=${unitPreference}&appid=${API_KEY}`
        );
        const weatherResult = await weatherResponse.json();
        if (weatherResponse.ok) {
          setWeatherData(weatherResult);
        } else {
          setLocationError(weatherResult.message);
        }

        const airQualityResponse = await fetch(
          `${AIR_QUALITY_API}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
        );
        const airQualityResult = await airQualityResponse.json();
        if (airQualityResponse.ok) {
          setAirQualityData(airQualityResult);
        } else {
          setLocationError(airQualityResult.message);
        }
      } catch (error) {
        setLocationError('An error occurred while fetching data');
      }
    };

    fetchWeatherAndAirQuality();
  }, [unitPreference]);

  const renderWeatherIcon = (iconCode) => {
    return `http://openweathermap.org/img/wn/${iconCode}@4x.png`;
  };

  const describeAirQuality = (aqi) => {
    const descriptions = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    return descriptions[aqi - 1] || 'Unknown';
  };

  const determineBackgroundColor = (condition) => {
    const backgroundColors = {
      Clear: '#87CEEB',
      Clouds: '#B0C4DE',
      Rain: '#4682B4',
      Snow: '#00CED1',
      Thunderstorm: '#2F4F4F',
      Drizzle: '#6495ED',
      Haze: '#BEBEBE',
    };
    return backgroundColors[condition] || '#FFFFFF';
  };

  if (weatherData) {
    const {
      main: { temp },
      weather: [weatherDetails],
    } = weatherData;
    const { icon, main: weatherCondition } = weatherDetails;
    const backgroundColor = determineBackgroundColor(weatherCondition);

    return (
      <View style={[styles.screenContainer, { backgroundColor }]} accessible accessibilityLabel="Current weather screen">
        <Image
          source={{ uri: renderWeatherIcon(icon) }}
          style={styles.icon}
          accessible
          accessibilityLabel="Weather condition icon"
        />
        <Text style={styles.temperature} accessible accessibilityLabel={`Current temperature is ${temp} degrees`}>
          {temp}°
        </Text>
        <Text style={styles.condition} accessible accessibilityLabel={`Weather condition: ${weatherCondition}`}>
          {weatherCondition}
        </Text>
        {airQualityData && (
          <View style={styles.airQualityContainer} accessible accessibilityLabel={`Air Quality Index: ${airQualityData.list[0].main.aqi}`}>
            <Text style={styles.airQualityText}>AQI: {airQualityData.list[0].main.aqi}</Text>
            <Text style={styles.airQualityDescription}>
              {describeAirQuality(airQualityData.list[0].main.aqi)}
            </Text>
          </View>
        )}
      </View>
    );
  } else {
    return (
      <View style={styles.loadingContainer} accessible accessibilityLabel="Loading weather information">
        <ActivityIndicator size="large" color="#0000ff" />
        {locationError && <Text style={styles.errorMessage}>{locationError}</Text>}
      </View>
    );
  }
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:40,
    padding:30,
    borderWidth:1,
    borderColor:"#7e64ff",
    shadowColor:"#7e64ff",
    elevation:4,
  },
  temperature: {
    fontSize: 44,
    color: '#fff',
    fontWeight: 'bold',
  },
  condition: {
    fontSize: 22,
    color: '#fff',
    marginVertical: 10,
  },
  icon: {
    width: 120,
    height: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
  },
  airQualityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  airQualityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  airQualityDescription: {
    marginLeft: 8,
    fontSize: 18,
    fontStyle: 'italic',
    color: '#fff',
  },
});

export default WeatherScreen;
