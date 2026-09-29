# StormSight AI — Judges Presentation & Evaluation Guide

**Problem Statement ID**: SIH26072  
**Problem Statement Title**: AIML based Nowcasting of thunderstorm and lightning using atmospheric observation including multiple radars, satellite, lightning and model data.  
**Ministry / Organization**: Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD)  
**Theme**: Disaster Management  

---

## 3-Minute Rapid Demonstration Flow

### Step 1: Open the Application & Launch Guided Demo
1. Navigate to the running web application.
2. Click the amber **`START DEMO`** button in the header.
3. The 9-step interactive walkthrough will orient you through the system context, multi-sensor inputs, radar sweeps, and inference logic.

### Step 2: Test Interactive Nowcast Execution
1. Click **`RUN NOWCAST`** in the top navigation bar.
2. Observe the progress notifications:
   - *Collecting observations (Radar, Satellite, Lightning, AWS, NWP)*
   - *Spatiotemporal feature engineering (CAPE, CIN, Lightning Jump)*
   - *Executing LightGBM + ConvLSTM surrogate models*
   - *Updating geospatial risk grids and active alerts*

### Step 3: Geospatial Map & Horizon Scrubber
1. On the **Nowcast Console** map, inspect the Central India / Madhya Pradesh focus.
2. Click the horizon buttons: **`NOW`**, **`+15m`**, **`+30m`**, **`+60m`**, **`+90m`**, **`+120m`**.
3. Notice the storm cells dynamically translate along their motion vector (58° NE at 38 km/h), while probability decays realistically over the 2-hour window.
4. Click on **Bhopal** or **Indore** markers on the map to inspect real-time soundings (CAPE 2850 J/kg, Radar 54 dBZ, Cloud top -58.4°C).

### Step 4: Operational Alert Center
1. Navigate to the **Alert Center** tab.
2. Review the active **`SEVERE THUNDERSTORM WARNING`** for Bhopal.
3. Test the **Acknowledge** button (which records operator confirmation).
4. Filter by severity or district.

### Step 5: Multi-Source Fusion & Sensor Health
1. Open the **Multisource Fusion** tab to review the 5-stage architectural pipeline.
2. Open the **Sensors & Model** tab to verify that the 6 observation feeds (DWR Radar, INSAT-3DR, Damini Lightning, AWS, NWP, Upper Air) display sub-minute latencies and operational status.

### Step 6: Verification & Scientific Rigor
1. Open the **Verification** tab.
2. Observe standard meteorological contingency metrics:
   - Critical Success Index (CSI): **0.762**
   - Probability of Detection (POD): **0.882**
   - False Alarm Ratio (FAR): **0.152**
   - Brier Score: **0.082**
3. Notice the explicit demo disclaimer and lead-time skill decay table.

---

## Key Differentiators for SIH26072
- **Serious Meteorological Visual Language**: Built following aerospace and telemetry design standards with dark obsidian backgrounds, tabular numerals, and zero AI marketing slop.
- **Dual-Stream ML Architecture**: Integrates both computer vision on spatial radar/satellite arrays and gradient boosting on thermodynamic thermodynamic soundings.
- **Lightning Jump Science**: Implements physics-based intra-cloud flash surge precursors providing 15–30 minute lead times before ground strikes occur.
