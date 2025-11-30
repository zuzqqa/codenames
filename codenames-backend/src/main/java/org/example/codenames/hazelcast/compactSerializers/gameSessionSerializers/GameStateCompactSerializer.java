package org.example.codenames.hazelcast.compactSerializers.gameSessionSerializers;

import com.hazelcast.nio.serialization.compact.CompactReader;
import com.hazelcast.nio.serialization.compact.CompactSerializer;
import com.hazelcast.nio.serialization.compact.CompactWriter;
import org.example.codenames.gameState.entity.GameState;

import java.util.ArrayList;
import java.util.Arrays;

/**
 * Compact serializer for the GameState class.
 */
public class GameStateCompactSerializer implements CompactSerializer<GameState> {

    /**
     * Gets the type name for the GameState class.
     * @return The type name "GameState".
     */
    @Override
    public String getTypeName() {
        return "GameState";
    }

    /**
     * Gets the compact class for the GameState class.
     * @return The GameState class.
     */
    @Override
    public Class<GameState> getCompactClass() {
        return GameState.class;
    }

    /**
     * Writes the GameState object to the CompactWriter.
     * @param writer The CompactWriter to write to.
     * @param gs The GameState object to write.
     */
    @Override
    public void write(CompactWriter writer, GameState gs) {
        writer.writeCompact("blueTeamLeader", gs.getBlueTeamLeader());
        writer.writeCompact("redTeamLeader", gs.getRedTeamLeader());
        writer.writeCompact("currentSelectionLeader", gs.getCurrentSelectionLeader());
        writer.writeInt32("blueTeamScore", gs.getBlueTeamScore());
        writer.writeInt32("redTeamScore", gs.getRedTeamScore());
        writer.writeInt32("teamTurn", gs.getTeamTurn());

        writer.writeArrayOfString("cards", gs.getCards());
        writer.writeArrayOfInt32("cardsColors", Arrays.stream(gs.getCardsColors()).mapToInt(Integer::intValue).toArray());
        writer.writeArrayOfInt32("cardsVotes", gs.getCardsVotes().stream().mapToInt(Integer::intValue).toArray());
        writer.writeArrayOfInt32(
                "cardsChosen",
                gs.getCardsChosen() != null
                        ? gs.getCardsChosen().stream().mapToInt(i -> i).toArray()
                        : new int[0]
        );

        writer.writeString("hint", gs.getHint());
        writer.writeInt32("hintNumber", gs.getHintNumber());
        writer.writeString("initialHintNumber", gs.getInitialHintNumber());
        writer.writeBoolean("isHintTurn", gs.isHintTurn());
        writer.writeBoolean("isGuessingTurn", gs.isGuessingTurn());
    }

    /**
     * Reads the GameState object from the CompactReader.
     * @param reader The CompactReader to read from.
     * @return The GameState object read from the reader.
     */
    @Override
    public GameState read(CompactReader reader) {
        GameState gs = new GameState();
        gs.setBlueTeamLeader(reader.readCompact("blueTeamLeader"));
        gs.setRedTeamLeader(reader.readCompact("redTeamLeader"));
        gs.setCurrentSelectionLeader(reader.readCompact("currentSelectionLeader"));
        gs.setBlueTeamScore(reader.readInt32("blueTeamScore"));
        gs.setRedTeamScore(reader.readInt32("redTeamScore"));
        gs.setTeamTurn(reader.readInt32("teamTurn"));

        gs.setCards(reader.readArrayOfString("cards"));
        gs.setCardsColors(Arrays.stream(reader.readArrayOfInt32("cardsColors")).boxed().toArray(Integer[]::new));

        gs.setCardsVotes(new ArrayList<>(Arrays.stream(reader.readArrayOfInt32("cardsVotes"))
                .boxed()
                .toList()));

        gs.setCardsChosen(new ArrayList<>(Arrays.stream(reader.readArrayOfInt32("cardsChosen"))
                .boxed()
                .toList()));

        gs.setHint(reader.readString("hint"));
        gs.setHintNumber(reader.readInt32("hintNumber"));
        gs.setInitialHintNumber(reader.readString("initialHintNumber"));
        gs.setHintTurn(reader.readBoolean("isHintTurn"));
        gs.setGuessingTurn(reader.readBoolean("isGuessingTurn"));

        return gs;
    }
}
