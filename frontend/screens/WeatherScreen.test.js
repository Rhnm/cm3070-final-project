import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import WeatherScreen from './WeatherScreen';

describe('WeatherScreen', () => {
    it('renders weather details correctly on successful API response', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          json: jest.fn().mockResolvedValue({
            main: { temp: 30 },
            weather: [{ icon: '02d', main: 'Clouds' }],
            list: [{ main: { aqi: 3 } }],
          }),
          ok: true,
        });
    
        const { getByText, getByRole } = render(<WeatherScreen />);
        
        // Waiting for the temperature text to appear
        await waitFor(() => {
          getByText('30°');
          getByText('Clouds');
          getByText('AQI: 3');
          getByText('Moderate');
        }, { timeout: 10000 }); // Setting timeout to 10 seconds
    
        const tempText = getByText('30°');
        const conditionText = getByText('Clouds');
        const aqiText = getByText('AQI: 3');
        const aqiDescriptionText = getByText('Moderate');
    
        expect(tempText).toBeTruthy();
        expect(conditionText).toBeTruthy();
        expect(aqiText).toBeTruthy();
        expect(aqiDescriptionText).toBeTruthy();
    
        global.fetch.mockClear();
      });


  it('renders error message on fetch failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ message: 'Fetch error' }),
      ok: false,
    });

    const { getByText } = render(<WeatherScreen />);
    await waitFor(() => getByText('Fetch error'));

    const errorText = getByText('Fetch error');
    expect(errorText).toBeTruthy();

    global.fetch.mockClear();
  });
});
