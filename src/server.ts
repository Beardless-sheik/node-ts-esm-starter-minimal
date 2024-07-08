import express, { Request, Response, NextFunction } from "express"
import "dotenv/config"
import axios from "axios"
import geoip from "geoip-lite"

const app = express()
const PORT = process.env.PORT || 3000

app.get("/", (req, res, next) => {
  try {
    return res.send({ message: "hello" })
  } catch (error) {
    return next(error)
  }
})

app.set("trust proxy", true)

const WEATHERAPI_KEY = "427359bd21f64f7681b192013240707"

app.get("/api/hello", async (req: Request, res: Response) => {
  const visitorName = (req.query.visitor_name as string) || "Guest"
  const clientIp = req.ip

  try {
    // Get location data using geoip-lite
    const geo = geoip.lookup(clientIp)
    const city = geo?.city || "Unknown Location"

    if (city === "Unknown Location") {
      res.json({
        client_ip: clientIp,
        location: city,
        greeting: `Hello, ${visitorName}! We couldn't determine your location.`,
      })
      return
    }

    // Get weather data from WeatherAPI
    const weatherResponse = await axios.get(
      `https://api.weatherapi.com/v1/current.json?key=${WEATHERAPI_KEY}&q=${city}`
    )
    const weatherData = weatherResponse.data
    const temperature = weatherData.current.temp_c

    // Send response
    res.json({
      client_ip: clientIp,
      location: city,
      greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}`,
    })
  } catch (error) {
    console.error(error)
    res.status(500).send("An error occurred while processing your request.")
  }
})

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
