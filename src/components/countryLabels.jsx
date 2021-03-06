import React from 'react'
import { Marker } from 'react-simple-maps'
import { labelDist, tinyCarib, labelAnchors } from "../helpers/markerParams"

export default function countryLabels() {
  let { quiz, quizGuesses, quizType, quizAnswers, countryMarkers, capitalMarkers, currentMap } = this.state
  return quiz ? quizGuesses.map((gss, i) => {
    let testing = quizType.split("_")[1]
    let alpha3Code = quizAnswers[i]
    if(gss){
      if(testing === "name" || testing === "flag" ) {
        var marker = countryMarkers.find(x => x.alpha3Code === alpha3Code);
      } else if (testing === "capital") {
        marker = capitalMarkers.find(x => x.alpha3Code === alpha3Code);
      }
      var markerName = marker.name
      var textAnchor = "middle"
      var dx = 0;
      var dy = marker ? marker.markerOffset: 0;

      if(currentMap === "carrib") {
        if(tinyCarib.includes(alpha3Code)){
          marker = testing !== "capital" ? capitalMarkers.find(x => x.alpha3Code === alpha3Code): marker;
          dx = 20;
          dy = -20;
          [dx, dy, textAnchor] = labelDist(dx, dy, alpha3Code)
        }
      }

      if (Object.keys(labelAnchors).includes(alpha3Code)) {
        textAnchor = labelAnchors[alpha3Code];
      }
    }
    return gss&&(
      <Marker
        key={i}
        marker={marker}
        style={{
          default: { fill: "#FF5722" },
          hover: { fill: "#FFFFFF" },
          pressed: { fill: "#FF5722" },
        }}
      >
        {testing === "capital" ? 
          (<circle
            cx={0}
            cy={0}
            r={1}
            className="dropFade"
            style={{
              stroke: "#FF5722",
              strokeWidth: 3,
              opacity: 0.9,
            }}
          />):null
        }
        <text
          textAnchor={textAnchor}
          x={dx}
          y={dy}
          className="mapLabel dropFade"
        >
          {markerName}
        </text>
      </Marker>
    )}
  ):null
}