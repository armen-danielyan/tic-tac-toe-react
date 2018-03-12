import Dimensions from 'Dimensions';
import React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TouchableWithoutFeedback,
    Image,
    Button,
    Modal
} from 'react-native';

var device = Dimensions.get('window');
var Sound = require('react-native-sound');

var hPlayerImg = require('./img/btncabb.png'),
    hPlayerWinImg = require('./img/btncabbwin.png'),
    aPlayerImg = require('./img/btnpaper.png'),
    aPlayerWinImg = require('./img/btnpaperwin.png'),
    ePlayerImg = require('./img/btnbgr.png'),
    bgr = require('./img/bgr.png');

var board = [],
    boardSize = 9,
    unVisited = " ",
    hPlayer = "o",
    aPlayer = "x",
    activeTurn = "h",
    choice,
    howWon = [];

class BackgroundImage extends Component {
    render() {
        return (
            <Image style={styles.backgroundImage} source={bgr}>
                {this.props.children}
            </Image>
        )
    }
}

class BoardItem extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }
    render() {
        return(
            <View style={styles.boardItem}>
                <TouchableWithoutFeedback onPress={this.props.btnsClick} >
                    <Image style={styles.boardItemImg} source={this.props.src} />
                </TouchableWithoutFeedback>
            </View>
        )
    }
}

class TikTakToeGreens extends Component {
    constructor(props) {
        super(props);

        this.state = {
            boardItemsSrc: [ePlayerImg, ePlayerImg, ePlayerImg, ePlayerImg, ePlayerImg, ePlayerImg, ePlayerImg, ePlayerImg, ePlayerImg]
        };

        Sound.setCategory('Playback');
        this.audioMove = new Sound('move.mp3', Sound.MAIN_BUNDLE, (error) => {});

        this.newGame = this.newGame.bind(this);
        this.btnsClick = this.btnsClick.bind(this);
        this.makeMove = this.makeMove.bind(this);
        this.makeComputerMove = this.makeComputerMove.bind(this);
        this.score = this.score.bind(this);
        this.miniMax = this.miniMax.bind(this);
        this.undoMove = this.undoMove.bind(this);
        this.gameOver = this.gameOver.bind(this);
        this.highlightWinner = this.highlightWinner.bind(this);

        this.newGame();
    }

    render() {
        return (
            <BackgroundImage>
                <View style={styles.mainContent}>
                    <View style={styles.header}>
                        <View style={styles.textLogo}>
                            <Text style={styles.headerTextSmall}>Greens</Text>
                            <Text style={styles.headerTextBig}>Tic Tac Toe</Text>
                        </View>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.board}>
                            <View style={styles.boardRow}>
                                <BoardItem src={this.state.boardItemsSrc[0]} btnsClick={()=>this.btnsClick(0)} />
                                <BoardItem src={this.state.boardItemsSrc[1]} btnsClick={()=>this.btnsClick(1)} />
                                <BoardItem src={this.state.boardItemsSrc[2]} btnsClick={()=>this.btnsClick(2)} />
                            </View>

                            <View style={styles.boardRow}>
                                <BoardItem src={this.state.boardItemsSrc[3]} btnsClick={()=>this.btnsClick(3)} />
                                <BoardItem src={this.state.boardItemsSrc[4]} btnsClick={()=>this.btnsClick(4)} />
                                <BoardItem src={this.state.boardItemsSrc[5]} btnsClick={()=>this.btnsClick(5)} />
                            </View>

                            <View style={styles.boardRow}>
                                <BoardItem src={this.state.boardItemsSrc[6]} btnsClick={()=>this.btnsClick(6)} />
                                <BoardItem src={this.state.boardItemsSrc[7]} btnsClick={()=>this.btnsClick(7)} />
                                <BoardItem src={this.state.boardItemsSrc[8]} btnsClick={()=>this.btnsClick(8)} />
                            </View>
                        </View>

                        <View style={styles.restartBtnWrap}>
                            <Text style={styles.restartBtn} onPress={this.newGame}>RESTART</Text>
                        </View>
                    </View>

                </View>
            </BackgroundImage>
        );
    }


    newGame() {
        for (var i = 0; i < boardSize; i++) {
            board[i] = unVisited;
        }
        this.setState({boardItemsSrc: [ePlayerImg, ePlayerImg, ePlayerImg, ePlayerImg, ePlayerImg, ePlayerImg, ePlayerImg, ePlayerImg, ePlayerImg]});
        howWon = [];
        activeTurn = "h";
    }

    btnsClick(data) {
        this.makeMove(data);
    }

    makeMove(pos) {
        if (!this.gameOver(board) && board[pos] == unVisited) {
            board[pos] = hPlayer;

            var boardItemsSrcTmp = this.state.boardItemsSrc;
            boardItemsSrcTmp[pos] = hPlayerImg;
            this.setState({boardItemsSrc: boardItemsSrcTmp});

            if (!this.gameOver(board)) {
                activeTurn = "c";
                this.makeComputerMove();
            }
        }
    }

    makeComputerMove() {
        this.miniMax(board, 0);

        var move = choice;
        board[move] = aPlayer;

        var boardItemsSrcTmp = this.state.boardItemsSrc;
        boardItemsSrcTmp[move] = aPlayerImg;
        this.setState({boardItemsSrc: boardItemsSrcTmp});

        choice = [];
        activeTurn = "h";
        if (this.gameOver(board)) {
            //turnInfo.text = "Your turn";
        }
    }

    score(game, depth) {
        var score = this.checkForWinner(game);
        if (score === 1)
            return 0;
        else if (score === 2)
            return depth - 10;
        else if (score === 3)
            return 10 - depth;
    }

    miniMax(tempBoardGame, depth) {
        if (this.checkForWinner(tempBoardGame) !== 0)
            return this.score(tempBoardGame, depth);

        depth += 1;

        var scores = [];
        var moves = [];
        var availableMoves = this.getAvailableMoves(tempBoardGame);
        var move, possibleGame;
        for(var i = 0; i < availableMoves.length; i++) {
            move = availableMoves[i];
            possibleGame = this.getNewState(move, tempBoardGame);
            scores.push(this.miniMax(possibleGame, depth));
            moves.push(move);
            tempBoardGame = this.undoMove(tempBoardGame, move);
        }

        var maxScore, maxScoreIndex, minScore, minScoreIndex;

        if (activeTurn === "c") {
            maxScore = Math.max.apply(Math, scores);
            maxScoreIndex = scores.indexOf(maxScore);
            choice = moves[maxScoreIndex];
            return scores[maxScoreIndex];
        } else {
            minScore = Math.min.apply(Math, scores);
            minScoreIndex = scores.indexOf(minScore);
            choice = moves[minScoreIndex];
            return scores[minScoreIndex];
        }
    }

    undoMove(game, move) {
        game[move] = unVisited;
        this.changeTurn();
        return game;
    }

    getNewState(move, game) {
        var piece = this.changeTurn();
        game[move] = piece;
        return game;
    }

    changeTurn() {
        var piece;
        if (activeTurn === "c") {
            piece = 'x';
            activeTurn = "h";
        } else {
            piece = 'o';
            activeTurn = "c";
        }
        return piece;
    }

    getAvailableMoves(game) {
        var possibleMoves = [];
        for (var i = 0; i < boardSize; i++)
            if (game[i] === unVisited)
                possibleMoves.push(i);
        return possibleMoves;
    }

    checkForWinner(game) {
        for (var i = 0; i <= 6; i += 3) {
            if (game[i] === hPlayer && game[i + 1] === hPlayer && game[i + 2] === hPlayer) {
                howWon = [i, i + 1, i + 2];
                return 2;
            }
            if (game[i] === aPlayer && game[i + 1] === aPlayer && game[i + 2] === aPlayer) {
                howWon = [i, i + 1, i + 2];
                return 3;
            }
        }

        for (i = 0; i <= 2; i++) {
            if (game[i] === hPlayer && game[i + 3] === hPlayer && game[i + 6] === hPlayer) {
                howWon = [i, i + 3, i + 6];
                return 2;
            }
            if (game[i] === aPlayer && game[i + 3] === aPlayer && game[i + 6] === aPlayer) {
                howWon = [i, i + 3, i + 6];
                return 3;
            }
        }

        if(game[0] === hPlayer && game[4] === hPlayer && game[8] === hPlayer) {
            howWon = [0, 4, 8];
            return 2;
        }
        if(game[2] === hPlayer && game[4] === hPlayer && game[6] === hPlayer) {
            howWon = [2, 4, 6];
            return 2;
        }
        if(game[0] === aPlayer && game[4] === aPlayer && game[8] === aPlayer) {
            howWon = [0, 4, 8];
            return 3;
        }
        if(game[2] === aPlayer && game[4] === aPlayer && game[6] === aPlayer) {
            howWon = [2, 4, 6];
            return 3;
        }

        for (i = 0; i < boardSize; i++) {
            if (game[i] !== hPlayer && game[i] !== aPlayer)
                return 0;
        }

        return 1;
    }

    gameOver(game) {
        var winner = this.checkForWinner(game);
        if (winner === 0) {
            this.audioMove.play();
            return false;
        } else if (winner === 1) {
            this.showGameDialog("It is a tie!");
        } else if (winner === 2) {
            this.showGameDialog("You have won!");
            this.highlightWinner(howWon, 2);
        } else {
            this.showGameDialog("Computer has won!");
            this.highlightWinner(howWon, 3);
        }
        return true;
    }

    highlightWinner(items, whoWon) {
        for(var i = 0; i < items.length; i++) {
            var winnerSrc = whoWon == 2 ? hPlayerWinImg : aPlayerWinImg;

            var boardItemsSrcTmp = this.state.boardItemsSrc;
            boardItemsSrcTmp[items[i]] = winnerSrc;
            this.setState({boardItemsSrc: boardItemsSrcTmp});
        }
    }

    showGameDialog(textDialog) {
        alert(textDialog);
    }
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: null,
        height: null,
        resizeMode: 'cover'
    },
    mainContent: {
        flexDirection: 'column'
    },
    header: {
        flexDirection: 'column',
        alignItems: 'center'
    },
    headerTextSmall: {
        color: '#e8ff00',
        textAlign: 'right'
    },
    headerTextBig: {
        fontFamily: 'GochiHand-Regular',
        color: '#ffffff',
        fontSize: 56
    },
    textLogo: {
        flexDirection: 'column'
    },
    content: {
        flexDirection: 'column'
    },
    board: {
        flexDirection: 'column',
        borderWidth: 8,
        borderColor: '#ffffff',
        borderRadius: 12,
        marginTop: 5,
        marginBottom: 20,
        marginRight: 20,
        marginLeft: 20,
        backgroundColor: '#76ad38',
        height: device.width - 40
    },
    boardRow: {
        flex: 1,
        flexDirection: 'row',
    },
    boardItem: {
        flex: 1,
    },
    boardItemImg: {
        flex: 1,
        width: '100%',
        aspectRatio: 1,
        resizeMode: 'stretch'
    },
    restartBtnWrap: {
        alignItems: 'center',
    },
    restartBtn: {
        color: '#e8ff00',
        borderWidth: 3,
        borderColor: '#ffffff',
        borderRadius: 16,
        paddingTop: 10,
        paddingBottom: 0,
        paddingRight: 20,
        paddingLeft: 20,
        textAlign: 'center',
        fontSize: 32,
        fontFamily: 'GochiHand-Regular'
    }
});

export default TikTakToeGreens;