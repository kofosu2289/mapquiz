import React, { Component } from 'react';
import { Button, Input } from 'semantic-ui-react';

class QuestionBox extends Component {
  constructor(props) {
    super(props)

    this.state = {
      userGuess: "",
      answerResult: null
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ userGuess: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.state.userGuess.length !== 0) {
      let answerResult = this.props.handleAnswer(this.state.userGuess)

      this.setState({ userGuess: "", answerResult })
    }
  }

  render() {
    let { quizAnswers, geographyPaths, activeQuestionNum } = this.props.quizData

    let [type, testing] = this.props.quizType.split("_");
    let typeTest = type === "type";

    if (typeTest) {
      var questionBoxContent =
        <div>
          <p>Enter the {testing} of the highlighted country</p>
          <form onSubmit={this.handleSubmit}>
            <Input type="text" autoFocus value={this.state.userGuess} onChange={this.handleChange} />
            <Button type="submit" size="large" className="qSubmit">Submit</Button>
          </form>
        </div>
    } else {
      let alpha = quizAnswers[activeQuestionNum]
      let region = geographyPaths
        .find(x => x.properties["alpha3Code"] === alpha)
        .properties[testing];

      if (testing === "flag") {
        region =
          <div className="qFlag">
            <img src={region} display="block" height="100px" border="1px solid black" alt="" />
          </div>
      }

      if (activeQuestionNum !== quizAnswers.length) {
        questionBoxContent =
          <div>
            Where is {region}?
            </div>
      }
    }

    if (activeQuestionNum === quizAnswers.length) {
      questionBoxContent =
        <div>
          {this.props.handleAnswer()}
        </div>
    }

    return (
      <div className={type === "type" ? "qInputBox" : ""}>
        {questionBoxContent}
      </div>
    )
  }
}

export default QuestionBox;