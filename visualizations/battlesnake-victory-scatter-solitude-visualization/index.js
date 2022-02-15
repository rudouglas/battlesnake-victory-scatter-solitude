import React, { useState } from "react";
import {
  VictoryBar,
  VictoryAnimation,
  VictoryScatter,
  VictoryChart,
  VictoryCursorContainer,
} from "victory";
import {
  Card,
  CardBody,
  HeadingText,
  NrqlQuery,
  Spinner,
  Button,
  Tile,
  Stack,
  StackItem,
  SectionMessage,
  Grid,
  GridItem,
} from "nr1";
import { START_SNAKE_DATA } from "../../src/constants";

export default class BattlesnakeVictoryScatterSolitudeVisualizationVisualization extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      snakeData: [
        { x: 50, y: 50, symbol: "diamond", size: 2 },
        { x: 49, y: 50, symbol: "square", size: 1 },
        { x: 48, y: 50, symbol: "square", size: 1 },
        { x: 47, y: 50, symbol: "square", size: 1 },
        { x: 46, y: 50, symbol: "square", size: 1 },
        { x: 45, y: 50, symbol: "square", size: 1 },
        { x: 44, y: 50, symbol: "square", size: 1 },
        { x: 43, y: 50, symbol: "square", size: 1 },
        { x: 42, y: 50, symbol: "square", size: 1 },
        { x: 41, y: 50, symbol: "square", size: 1 },
        { x: 40, y: 50, symbol: "square", size: 1 },
      ],
      domainData: [
        { x: 0, y: 0 },
        { x: 0, y: 100 },
        { x: 100, y: 100 },
        { x: 100, y: 0 },
      ],
      foodData: [{ x: 90, y: 90, symbol: "star", size: 2 }],
      dead: false,
      started: false,
      gameOn: false,
      direction: "right",
      turning: false,
      turningDirection: null,
      pivotPoint: null,
      moving: false,
      timeout: 100,
      score: 0,
      showDead: false,
    };
  }
  handleKeyDown = (e) => {
    const { direction, dead, started, gameOn, snakeData, moving } = this.state;
    console.log(e.keyCode);
    console.log({ direction, dead, gameOn, started, snakeData, moving });
    switch (e.keyCode) {
      case 32:
        if (gameOn) {
          this.setState({ gameOn: false });
        } else {
          this.startGame();
        }
        break;
      case 37:
        if (direction !== "right" && !dead && gameOn) {
          console.log("left");
          this.setState({
            direction: "left",
          });
        }
        break;
      case 38:
        if (direction !== "down" && !dead && gameOn) {
          console.log("up");
          this.setState({ direction: "up" });
        }
        break;
      case 39:
        if (direction !== "left" && !dead && gameOn) {
          console.log("right");
          this.setState({ direction: "right" });
        }
        break;
      case 40:
        if (direction !== "up" && !dead && gameOn) {
          console.log("down");
          this.setState({ direction: "down" });
        }
        break;
      case 82:
        const reset = true;
        this.stopGame(reset);
        break;
    }
    this.setState({
      pivotPoint: { pivotX: snakeData[0].x, pivotY: snakeData[0].y },
    });
  };
  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }
  componentDidUpdate() {
    const { dead, gameOn, moving } = this.state;
    if (dead) {
      this.stopGame();
    } else if (gameOn && !moving) {
      this.makeTimer();
    }
  }
  speedUp = () => {
    const { timeout, score } = this.state;
    if (score % 10 === 0) {
      this.setState({ timeout: timeout - 20 > 0 ? timeout - 20 : timeout });
    }
  };
  checkIfDead = (head) => {
    const { snakeData } = this.state;
    const { x, y } = head;
    if ([0, 100].includes(x) || [0, 100].includes(y)) {
      this.setState({ dead: true });
      return true;
    }
    const snakeCollide = snakeData.filter((part, index) => {
      if (index === 0) {
        return false;
      }
      return part.x === x && part.y === y;
    });
    console.log({ snakeCollide });
    if (snakeCollide.length > 0) {
      this.setState({ dead: true });
      return true;
    }
    return false;
  };
  checkIfEaten = (head) => {
    const { foodData, score } = this.state;
    // console.log({ head, foodData });
    if (foodData[0].x == head.x && foodData[0].y == head.y) {
      console.log("Eaten");
      this.setState({
        foodData: this.generateFood(),
        score: score + 1,
      });
      this.lengthenSnake();
      this.speedUp();
    }
  };
  lengthenSnake = () => {
    const { snakeData } = this.state;
    const length = snakeData.length;
    let previousPartX = snakeData[0].x;
    let previousPartY = snakeData[0].y;
    let tmpPartX = previousPartX;
    let tmpPartY = previousPartY;
    for (let i = 1; i < snakeData.length; i++) {
      tmpPartX = snakeData[i].x;
      tmpPartY = snakeData[i].y;
      snakeData[i].x = previousPartX;
      snakeData[i].y = previousPartY;
      previousPartX = tmpPartX;
      previousPartY = tmpPartY;
    }
    snakeData[length] = {
      x: previousPartX,
      y: previousPartY,
      symbol: "square",
      size: 1,
    };
    this.setState({ snakeData });
  };
  generateFood = () => {
    const x = Math.floor(Math.random() * (98 - 1 + 1)) + 2;
    const y = Math.floor(Math.random() * (98 - 1 + 1)) + 2;
    return [{ x, y, symbol: "star", size: 2 }];
  };
  goUp = (head) => {
    return { ...head, y: head.y + 1 };
  };
  goDown = (head) => {
    return { ...head, y: head.y - 1 };
  };
  goRight = (head) => {
    return { ...head, x: head.x + 1 };
  };
  goLeft = (head) => {
    return { ...head, x: head.x - 1 };
  };
  moveHead = (head) => {
    console.log("Moving Head");

    const { direction } = this.state;
    console.log({ direction });
    let newHead;
    switch (direction) {
      case "right":
        newHead = this.goRight(head);
        break;
      case "left":
        newHead = this.goLeft(head);
        break;
      case "up":
        newHead = this.goUp(head);
        break;
      default:
        newHead = this.goDown(head);
    }
    console.log("Moving", newHead);
    const dead = this.checkIfDead(newHead);
    this.checkIfEaten(newHead);
    return { newHead, dead };
  };

  stopGame = (reset) => {
    console.log("Stopping");
    const { direction, dead, started, snakeData, moving } = this.state;
    console.log({ direction, dead, started, snakeData, moving });
    this.setState({
      gameOn: false,
      moving: false,
      snakeData: reset ? [...START_SNAKE_DATA] : snakeData,
      dead: false,
      showDead: true,
      direction: "right",
      timeout: 100,
    });
  };

  startGame = () => {
    const { dead, started, snakeData } = this.state;
    console.log({ dead, started, snakeData });
    this.setState({ gameOn: true, dead: false, showDead: false, score: 0 });
  };
  makeTimer() {
    const { snakeData, gameOn, timeout, started, moving, direction } =
      this.state;
    if (moving || !gameOn) {
      return;
    }
    this.setState({ moving: true });
    setTimeout(() => {
      let previousPartX = snakeData[0].x;
      let previousPartY = snakeData[0].y;
      let tmpPartX = previousPartX;
      let tmpPartY = previousPartY;
      const { newHead, dead } = this.moveHead(snakeData[0]);
      console.log({ direction });
      if (dead) {
        return;
      }
      snakeData[0] = newHead;
      for (let i = 1; i < snakeData.length; i++) {
        tmpPartX = snakeData[i].x;
        tmpPartY = snakeData[i].y;
        snakeData[i].x = previousPartX;
        snakeData[i].y = previousPartY;
        previousPartX = tmpPartX;
        previousPartY = tmpPartY;
      }
      console.log({ snakeData });
      this.setState({ snakeData, moving: false, dead });
    }, timeout);
  }
  resetSnake = () => {
    console.log("RESETTING");
    console.log({ START_SNAKE_DATA });
    this.setState({
      snakeData: [...START_SNAKE_DATA],
    });
  };
  render() {
    const { snakeData, domainData, foodData, score, showDead } = this.state;
    const data = [...snakeData, ...foodData];
    return (
      <>
        <Grid>
          <GridItem columnSpan={2}>
            <Stack
              directionType={Stack.DIRECTION_TYPE.VERTICAL}
              style={{ width: "100%" }}
            >
              <StackItem style={{ width: "100%", padding: "2em 2em 0 2em" }}>
                <img width="80%" src="https://i.ibb.co/1JwPY79/battlesnake-NR.png" />
              </StackItem>
              <StackItem style={{ width: "100%", padding: "2em 2em 0 2em" }}>
                <Button
                  onClick={this.startGame}
                  style={{ width: "80%" }}
                  type={Button.TYPE.PRIMARY}
                >
                  Start [Space]
                </Button>
              </StackItem>
              <StackItem style={{ width: "100%", padding: "0 2em 0 2em" }}>
                <Button
                  onClick={() => this.setState({ started: false })}
                  style={{ width: "80%" }}
                  type={Button.TYPE.OUTLINE}
                >
                  Stop
                </Button>
              </StackItem>
              <StackItem style={{ width: "100%", padding: "0 2em 0 2em" }}>
                <Button
                  onClick={this.resetSnake}
                  style={{ width: "80%" }}
                  type={Button.TYPE.DESTRUCTIVE}
                >
                  Reset [R]
                </Button>
              </StackItem>
              <StackItem style={{ width: "100%" }}>
                <HeadingText
                  type={HeadingText.TYPE.HEADING_1}
                  spacingType={[HeadingText.SPACING_TYPE.EXTRA_LARGE]}
                >
                  SCORE: {score}
                </HeadingText>
              </StackItem>
              <StackItem style={{ width: "100%", padding: "0 2em 0 2em" }}>
                {showDead && (
                  <SectionMessage
                    type={SectionMessage.TYPE.CRITICAL}
                    title="Game Over"
                    style={{ width: "80%" }}
                  />
                )}
              </StackItem>
            </Stack>
          </GridItem>

          <GridItem columnSpan={10}>
            <div style={{ width: "85%", padding: "20px" }}>
              <div style={{ border: "brown 5px solid" }}>
                <VictoryScatter
                  data={data}
                  domain={{ x: [0, 100], y: [0, 100] }}
                  padding={0}
                  minDomain={0}
                  maxDomain={100}
                  style={{
                    data: {
                      fill: ({ datum }) =>
                        datum.symbol === "star"
                          ? "red"
                          : datum.symbol === "square"
                          ? "blue"
                          : datum.symbol === "diamond"
                          ? "purple"
                          : "black",
                    },
                    labels: {
                      fontSize: 15,
                      fill: ({ datum }) =>
                        datum.x === 3 ? "#000000" : "#c43a31",
                    },
                    border: "brown 5px solid",
                  }}
                  animate={{
                    duration: 200,
                    onLoad: { duration: 1000 },
                  }}
                  containerComponent={
                    <VictoryCursorContainer
                      cursorLabel={({ datum }) =>
                        `${datum.x.toPrecision(2)}, ${datum.y.toPrecision(2)}`
                      }
                    />
                  }
                />
              </div>
            </div>
          </GridItem>
        </Grid>
      </>
    );
  }
}
