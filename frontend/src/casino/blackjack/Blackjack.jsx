import { useState, useEffect } from "react";
import BlackjackTable from "./BlackjackTable";
import DealButton from "./DealButton";
import ActionButtons from "./ActionButtons";
import PlayerStatusBar from "../../shared/components/PlayerStatusBar";
import { createDeck, shuffleDeck, calculateHandValue } from "./CardUtilities";
import GameOverPopup from "./GameOverPopup";
import WagerButton from "../../shared/components/WagerButton";

const Blackjack = ({ balance, setBalance, allPoints, setAllPoints }) => {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [dealerTotal, setDealerTotal] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [wager, setWager] = useState(1);
  const [gameResult, setGameResult] = useState("");

  useEffect(() => {
    if (balance > 0) {
      initializeGame();
    }
  }, []);

  const initializeGame = () => {
    const newDeck = shuffleDeck(createDeck());
    setDeck(newDeck);
    resetGame();
  };

  const resetGame = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setPlayerTotal(0);
    setDealerTotal(0);
    setIsPlayerTurn(false);
    setIsGameOver(false);
    setGameResult("");
  };

  const dealInitialCards = () => {
    if (deck.length < 4) return; // Ensure there are enough cards to deal
    const newDeck = [...deck];
    const playerCards = [newDeck.pop(), newDeck.pop()];
    const dealerCards = [newDeck.pop(), newDeck.pop()];

    setPlayerHand(playerCards);
    setDealerHand(dealerCards);
    setPlayerTotal(calculateHandValue(playerCards));
    setDealerTotal(calculateHandValue([dealerCards[0]])); // Only use face up card's value for initial dealer total
    setDeck(newDeck);
    setIsPlayerTurn(true);
    setBalance((prevBalance) => prevBalance - wager); // Deduct the wager from balance
  };

  const handleHit = () => {
    if (!isPlayerTurn || isGameOver) return;
    const newDeck = [...deck];
    const newCard = newDeck.pop();
    const newPlayerHand = [...playerHand, newCard];

    const newPlayerTotal = calculateHandValue(newPlayerHand);
    setPlayerHand(newPlayerHand);
    setDeck(newDeck);
    setPlayerTotal(newPlayerTotal);

    if (newPlayerTotal > 21) {
      endGame("You Busted!");
    }
  };

  const handleStand = () => {
    setIsPlayerTurn(false);
    handleDealerTurn();
  };

  const handleDealerTurn = () => {
    const newDeck = [...deck];
    let newDealerHand = [...dealerHand];
    let newDealerTotal = calculateHandValue(newDealerHand);
    while (newDealerTotal < 17) {
      newDealerHand = [...newDealerHand, newDeck.pop()];
      newDealerTotal = calculateHandValue(newDealerHand);
    }
    setDealerHand(newDealerHand);
    setDeck(newDeck);
    setDealerTotal(newDealerTotal);

    determineWinner(newDealerTotal);
  };

  const determineWinner = (dealerTotal) => {
    const playerValue = playerTotal;

    if (dealerTotal > 21 || playerValue > dealerTotal) {
      endGame(`Congrats! You won ${80 * wager} points!`);
      setBalance((prevBalance) => prevBalance + 80 * wager);
    } else if (playerValue < dealerTotal) {
      endGame("Dealer Wins!");
    } else {
      endGame("Push! It's a tie.");
      setBalance((prevBalance) => prevBalance + wager);
    }
  };

  const endGame = (result) => {
    setGameResult(result);
    setIsGameOver(true);
  };

  return (
    <>
      <div className="blackjack-game">
        {isGameOver && (
          <GameOverPopup result={gameResult} onClose={resetGame} />
        )}
        <div className="slot-machine">
          <BlackjackTable
            playerHand={playerHand}
            dealerHand={dealerHand}
            playerTotal={playerTotal}
            dealerTotal={dealerTotal}
            isPlayerTurn={isPlayerTurn}
          />
          <div className="controls">
            {isPlayerTurn ? (
              <ActionButtons handleHit={handleHit} handleStand={handleStand} />
            ) : (
              <DealButton
                handleDeal={dealInitialCards}
                balance={balance}
                wager={wager}
                disabled={isPlayerTurn || isGameOver}
              />
            )}
            <WagerButton
              wager={wager}
              setWager={setWager}
              disabled={isPlayerTurn}
            />
          </div>
        </div>
      </div>
      <PlayerStatusBar
        allPoints={allPoints}
        balance={balance}
        setBalance={setBalance}
      />
    </>
  );
};

export default Blackjack;
