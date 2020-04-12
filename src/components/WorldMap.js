import React, { Component } from "react"
import { geoMercator, geoPath } from "d3-geo"
import { feature } from "topojson-client"

class WorldMap extends Component {
  constructor() {
    super()
    this.state = {
      worldData: [],
      width: 0,
      height: 0
    }

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.handleCountryClick = this.handleCountryClick.bind(this);
  }

  projection() {
    return geoMercator()
      .scale(200)
      .translate([ 960 / 2, 500 / 2 ])
  }

  componentDidMount() {
    fetch("/world-50m.json")
      .then(response => {
        if (response.status !== 200) {
          console.log(`There was a problem: ${response.status}`)
          return;
        }
        response.json().then(worldData => {
          let isoUrl = 'https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.json';

          fetch(isoUrl)
            .then(response => response.json())
            .then(cIso => {
              let data = feature(worldData, worldData.objects.countries).features;

              //Remove Antarctica
              data = data.filter(x => +x.id !== 10 ? 1 : 0)
              
              data.filter(x => (
                +x.id !== -99
              ) ? 1 : 0).forEach(x => {
                let y = cIso.find(c => +c["country-code"] === +x.id)
                x.properties = {
                  name: y.name,
                  acronym: y['alpha-3'],
                  region: y.region,
                  'sub-region': y['sub-region'],
                  'intermediate-region': y['intermediate-region']
                }
              })

              this.setState({ worldData: data })
            })
        })
      })

    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({width: window.innerWidth, height: window.innerHeight });
  }

  handleCountryClick(countryIndex) {
    let x = this.state.worldData[countryIndex].properties
    console.log(x);
  }
  
  render() {
    return (
      <svg
        width={ this.state.width }
        height={ this.state.width/2.2 }
        viewBox="0 -120 960 620"
      >
        <g className="countries">
          {
            this.state.worldData.map((d,i) => (
              <path
                key={ `path-${ i }` }
                d={ geoPath().projection(this.projection())(d) }
                className="country"
                fill="white"
                stroke="black"
                strokeWidth={ 0.3 }
                onClick={ () => this.handleCountryClick(i) }
              />
            ))
          }
        </g>
      </svg>
    )
  }
}

export default WorldMap;