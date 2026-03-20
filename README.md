# Forest Fire Real-Time Monitoring System

## Overview

A real-time forest fire detection system using an ATmega328 microcontroller, environmental sensors, and LoRa communication. It monitors temperature, humidity, and smoke levels, and transmits data to a remote server for early warning and visualization.

## Components

* ATmega328
* DHT22 (Temperature & Humidity)
* MQ-2 (Smoke Sensor)
* LoRa Module (SX1278 / RFM95)
* GPS Module

## Working Principle

Sensor data and GPS coordinates are collected and transmitted every 5 seconds via LoRa to a gateway, which forwards the data to a cloud-based dashboard for monitoring and alerts.

## Features

* Long-range communication (LoRa)
* Low power consumption
* Real-time monitoring
* GPS-based location tracking

## Technologies

* Embedded C
* HTML, CSS, JavaScript
* Node.js
* REST APIs



## Conclusion

A low-cost, efficient solution for early forest fire detection in remote areas.
