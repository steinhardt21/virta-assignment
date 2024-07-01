import { describe, expect, test, vi } from 'vitest'
import worker from './server'
// Assuming these imports are necessary for other parts of the test file
import * as company from './handlers/company'
import { getStations, createStation } from './handlers/station'

const originalData = {
  "data": [
    {
      "id": "cly30y3ey0009hbf7v2mtzv9k",
      "name": "station-a",
      "latitude": 42.48678,
      "longitude": 1.44548,
      "createdAt": "2024-07-01T13:37:14.698Z",
      "updatedAt": "2024-07-01T13:37:14.698Z",
      "companyId": "cly30w3qg0001hbf728a4iii0"
    },
    {
      "id": "cly30yil8000bhbf7869ksctd",
      "name": "station-b",
      "latitude": 42.54941,
      "longitude": 1.45701,
      "createdAt": "2024-07-01T13:37:34.364Z",
      "updatedAt": "2024-07-01T13:37:34.364Z",
      "companyId": "cly30w3qg0001hbf728a4iii0"
    },
    {
      "id": "cly30zo7q000dhbf7u1r5q0yn",
      "name": "station-c",
      "latitude": 42.55784,
      "longitude": 1.46979,
      "createdAt": "2024-07-01T13:38:28.310Z",
      "updatedAt": "2024-07-01T13:38:28.310Z",
      "companyId": "cly30ww8m0005hbf7tm5tr1hg"
    },
    {
      "id": "cly31078b000fhbf7xxeb0m0a",
      "name": "station-d",
      "latitude": 42.44205,
      "longitude": 1.53489,
      "createdAt": "2024-07-01T13:38:52.956Z",
      "updatedAt": "2024-07-01T13:38:52.956Z",
      "companyId": "cly30x80u0007hbf7ouxmywei"
    }
  ]
};

// Correctly mock the getStations function
vi.mock('./handlers/station', () => ({
  getStations: vi.fn(() => Promise.resolve(originalData)),
  createStation: vi.fn((station) => Promise.resolve({ ...station, id: 'newlyCreatedStationId', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })), // Simulate adding an id and timestamps to the created station
  StationSchema: vi.fn()
}))

describe('Test /api/stations', () => {
  test('GET /', async () => {
    // Execute the request to the mocked server
    const res = await worker.request('/api/stations', { method: 'GET' })

    // Assertions
    expect(getStations).toHaveBeenCalled() // Check if getStations was called
    expect(res.status).toBe(200)

    const responseData = await res.json() // Use res.json() if the response is JSON
    console.log(responseData)
    expect(responseData).toEqual({data:originalData})
  })
})

