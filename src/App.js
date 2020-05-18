import React, { Component } from 'react';
import './App.css';
import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography,
} from "react-simple-maps"
import { feature } from "topojson-client"
import { Motion, spring } from "react-motion"
import WheelReact from 'wheel-react';
import countryData from "./assets/country_data.json"
import InfoTab from "./components/infoTab.js"
import alpha3Codes from "./assets/regionAlpha3Codes.js";
import mapConfig from "./assets/regionMapConfig.js"

class App extends Component {
  constructor() {
    super()

    this.state = {
      center: [0,0],
      zoom: 1,
      defaultZoom: 1,
      geographyPaths: [],
      selectedProperties: "",
      disableOptimization: false,
      filterRegions: [],
      quizAnswers: [],
      quizGuesses: [],
      quiz: false,
      activeQuestionNum: null,
    }

    WheelReact.config({
      left: () => {
        // console.log('wheel left detected.');
      },
      right: () => {
        // console.log('wheel right detected.');
      },
      up: () => {
        // console.log('wheel up detected.');
        this.handleZoomOut()
      },
      down: () => {
        // console.log('wheel down detected.');
        this.handleZoomIn()
      }
    });

    this.handleZoomIn = this.handleZoomIn.bind(this)
    this.handleZoomOut = this.handleZoomOut.bind(this)    
    this.handleReset = this.handleReset.bind(this)
    this.handleCountryClick = this.handleCountryClick.bind(this)
    this.handleRegionSelect = this.handleRegionSelect.bind(this)
    this.handleQuiz = this.handleQuiz.bind(this)
    this.handleAnswer = this.handleAnswer.bind(this)
    this.handleQuizClose = this.handleQuizClose.bind(this)
  }

  componentDidMount() {
    this.loadPaths()
  }

  componentWillUnmount () {
    WheelReact.clearTimeout();
  }

  loadPaths() {
    fetch("/world-50m.json")
      .then(response => {
        if (response.status !== 200) {
          console.log(`There was a problem: ${response.status}`)
          return;
        }
        response.json().then(worldData => {

          let data = feature(worldData, worldData.objects.countries).features;

          // Remove Antarctica and invalid iso codes
          data = data.filter(x => +x.id !== 10 ? 1:0);

          let essentialData = ["name", "capital", "population", "area", "flag", "alpha3Code"];

          data.filter(x => (+x.id !== -99) ? 1:0).forEach(x => {
            let y = countryData.find(c => +c["numericCode"] === +x.id)

            essentialData.forEach(key => {
              x.properties[key] = y[key]
            })
          })

          this.setState({ geographyPaths: data })
        })
      })
  }

  handleZoomIn() {
    this.setState({
      zoom: this.state.zoom * 2,
    })
  }

  handleZoomOut() {
    this.setState({
      zoom: this.state.zoom / 2,
    })
  }

  handleReset() {
    this.setState({
      center: [this.state.center[0], this.state.center[1] + Math.random() / 1000],
      zoom: this.state.defaultZoom,
    })
  }

  handleMoveStart(currentCenter) {
    // console.log("Current center: ", currentCenter)
  }

  handleMoveEnd(newCenter) {
    // console.log("New center: ", newCenter)
  }

  handleCountryClick(geo) {
    if (this.state.quiz === true) {
      if (this.state.activeQuestionNum === this.state.quizGuesses.length) {
        this.setState(prevState => {
          let quizGuesses = [...prevState.quizGuesses];
          quizGuesses.push(geo.properties["alpha3Code"]);
          return ({
            quizGuesses,
            disableOptimization: true,
            selectedProperties: geo.properties
          })
        }, () => { this.setState({ disableOptimization: false }) }
        )
      }
    } else {
      this.setState(prevState => ({
        disableOptimization: true,
        selectedProperties: prevState.selectedProperties !== geo.properties ? geo.properties : "",
      }), () => { this.setState({ disableOptimization: false }) }
      )
    }
  }

  handleRegionSelect(region) {
    let { center, zoom, defaultZoom } = mapConfig[region];
    this.setState({
      disableOptimization: true,
      zoom,
      defaultZoom,
      center,
      filterRegions: alpha3Codes[region]
    }, () => { this.setState({ disableOptimization: false }) })
  }

  handleQuiz() {
    let quizAnswers = [...this.state.filterRegions]
    quizAnswers.reduce((dum1, dum2, i) => {
      const j = Math.floor(Math.random() * (quizAnswers.length - i) + i);
      [quizAnswers[i], quizAnswers[j]] = [quizAnswers[j], quizAnswers[i]];
      return quizAnswers
    }, quizAnswers)

    this.setState({quizAnswers, activeQuestionNum: 0})
  }

  handleAnswer(){
    if(this.state.activeQuestionNum === this.state.quizGuesses.length - 1) {
      let ans = this.state.quizGuesses;
      let cor = this.state.quizAnswers;
      let idx = this.state.activeQuestionNum;
      let text = ans[idx] === cor[idx] ? "that is correct!":"that is incorrect!";

      let next = <button 
        onClick={ () => {
          this.setState( prevState => 
            ({
              selectedProperties: "",
              activeQuestionNum: prevState.activeQuestionNum + 1,
              disableOptimization: true
            })
            , () => { this.setState({ disableOptimization: false }) }
          )
        }
      }>NEXT</button>;

      if(idx === cor.length - 1) {
        var score = ans
          .reduce((total, x, i) => {
            return total += (x === cor[i])*1
          }, 0);
        var scoreText = <p>Your score is {score} / {cor.length} or {Math.round(score/cor.length*100)}%</p>
        next = ""
      }

      return (
        <div>
          <p>{text}</p>
          {scoreText}
          {next}
        </div>
      )
    }
  }

  handleQuizClose(){
    this.setState({
      quizAnswers: [],
      quizGuesses: [],
      quiz: false,
      activeQuestionNum: null,
      disableOptimization: true
    }, () => { this.setState({ disableOptimization: false }) } )
  }

  render() {
    let quiz = this.state.quiz;
    let country, answerResult, alpha

    if(quiz) {
      alpha = this.state.quizAnswers[this.state.activeQuestionNum]
      country = this.state.geographyPaths
        .find(x => x.properties["alpha3Code"] === alpha)
        .properties.name;

      answerResult = this.handleAnswer()
    } else {
      answerResult = ""
    }

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Country Data</h1>
        </header>

        <div style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)"
        }}>
          <button onClick={ this.handleZoomIn }>{ "Zoom in" }</button>
          <button onClick={ this.handleZoomOut }>{ "Zoom out" }</button>
          <button onClick={ this.handleReset }>{ "Reset view" }</button>
        </div>

        {this.state.filterRegions.length !== 0 ?
          <div className="App-quiz">
            {!this.state.quiz ? 
              <button onClick={ () => { this.setState({quiz: true}, this.handleQuiz) } }>
                START QUIZ
              </button> 
              :
              <div>
                <button className="App-quiz-close" onClick={ this.handleQuizClose}>X</button>
                Where is {country}?
                {answerResult}
              </div>
            }
          </div>:""
        }

        <div style={{
          position: "absolute",
          top: "calc(150px + 1em)",
          right: "1em",
          display: "flex",
          flexDirection: "column",
        }}>
          <button onClick={ () => this.handleRegionSelect("world") }>{ "World" }</button>
          <button onClick={ () => this.handleRegionSelect("naca") }>{ "North and Central America" }</button>
          <button onClick={ () => this.handleRegionSelect("south") }>{ "South America" }</button>
          <button onClick={ () => this.handleRegionSelect("carrib") }>{ "Carribean" }</button>
          <button onClick={ () => this.handleRegionSelect("africa") }>{ "Africa" }</button>
          <button onClick={ () => this.handleRegionSelect("europe") }>{ "Europe" }</button>
          <button onClick={ () => this.handleRegionSelect("asia") }>{ "Asia" }</button>
          <button onClick={ () => this.handleRegionSelect("oceania") }>{ "Oceania" }</button>
        </div>
        
        <InfoTab country={this.state.selectedProperties}/>

        <div {...WheelReact.events}>
          <Motion
            defaultStyle={{
              zoom: this.state.defaultZoom,
              x: this.state.center[0],
              y: this.state.center[1],
            }}
            style={{
              zoom: spring(this.state.zoom, {stiffness: 210, damping: 20}),
              x: spring(this.state.center[0], {stiffness: 210, damping: 20}),
              y: spring(this.state.center[1], {stiffness: 210, damping: 20}),
            }}
          >
            {({zoom,x,y}) => (
              <ComposableMap
                projectionConfig={{ scale: 205 }}
                width={980}
                height={551}
                style={{
                  width: "100%",
                  height: "auto"
                }}
              >
                <ZoomableGroup
                  center={[x,y]}
                  zoom={zoom}
                  onMoveStart={this.handleMoveStart}
                  onMoveEnd={this.handleMoveEnd}
                >
                  <Geographies 
                    geography={ this.state.geographyPaths }
                    disableOptimization={this.state.disableOptimization}
                  >
                    {(geographies, projection) => 
                      geographies.map((geography, i) => {
                        const isSelected = this.state.selectedProperties === geography.properties
                        let defaultColor, hoverColor;

                        defaultColor = "#FFF";
                        hoverColor = "rgba(105, 105, 105, .2)";

                        if (isSelected) {
                          defaultColor = "rgba(105, 105, 105, .7)";
                          hoverColor = "rgba(105, 105, 105, .7)";
                        }

                        if(this.state.quiz === true){
                          let geoQuizIdx = this.state.quizGuesses.indexOf(geography.properties.alpha3Code)
                          if( geoQuizIdx !== -1 && this.state.quizGuesses[geoQuizIdx] === this.state.quizAnswers[geoQuizIdx]) {
                            defaultColor = "rgb(144, 238, 144)"
                            hoverColor = "rgb(144, 238, 144)"
                          }
                        }
                        let render = true
                        if (this.state.filterRegions.ength !== 0) {
                          render = this.state.filterRegions.indexOf(geography.properties["alpha3Code"]) !== -1
                        }

                      return render && (
                        <Geography
                        key={ `geography-${i}` }
                        cacheId={ `geography-${i}` }
                        geography={ geography }
                        projection={ projection }
                        onClick={this.handleCountryClick}
                        fill="white"
                        stroke="black"
                        strokeWidth={ 0.1 }
                        style={{
                          default: {
                            fill : defaultColor,
                            transition: "fill .5s",
                          },
                          hover:   {
                            fill : hoverColor,
                            transition: "fill .5s",
                          },
                          pressed: {
                            fill : "rgba(105, 105, 105, 1)",
                            transition: "fill .5s"
                          },
                        }}
                      />
                      )}
                    )}
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>
            )}
          </Motion>
        </div>
      </div>
    );
  }
}

export default App;
