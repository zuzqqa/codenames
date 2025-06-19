package org.example.codenames.hazelcast.compactSerializers.gameSessionSerializers;

import com.hazelcast.nio.serialization.compact.CompactReader;
import com.hazelcast.nio.serialization.compact.CompactWriter;
import com.hazelcast.nio.serialization.compact.CompactSerializer;

import org.example.codenames.gameSession.entity.GameSession;
import org.example.codenames.gameSession.entity.GameSession.sessionStatus;
import org.example.codenames.user.entity.User;

import java.util.*;

public class GameSessionCompactSerializer implements CompactSerializer<GameSession> {

    @Override
    public String getTypeName() {
        return "GameSession";
    }

    @Override
    public Class<GameSession> getCompactClass() {
        return GameSession.class;
    }

    @Override
    public void write(CompactWriter writer, GameSession session) {
        writer.writeString("status", session.getStatus() != null ? session.getStatus().name() : null);
        writer.writeString("sessionId", session.getSessionId() != null ? session.getSessionId().toString() : null);
        writer.writeString("gameName", session.getGameName());
        writer.writeInt32("maxPlayers", session.getMaxPlayers() != null ? session.getMaxPlayers() : 0);
        writer.writeString("password", session.getPassword());
        writer.writeInt64("votingStartTime", session.getVotingStartTime() != null ? session.getVotingStartTime() : 0L);
        writer.writeBoolean("voiceChatEnabled", session.getVoiceChatEnabled());

        // Flatten List<List<User>> into a single list and store nested sizes
        List<User> flatUsers = new ArrayList<>();
        List<Integer> userGroupSizes = new ArrayList<>();
        if (session.getConnectedUsers() != null) {
            for (List<User> group : session.getConnectedUsers()) {
                userGroupSizes.add(group.size());
                flatUsers.addAll(group);
            }
        }
        writer.writeArrayOfInt32("userGroupSizes", userGroupSizes.stream().mapToInt(i -> i).toArray());
        writer.writeArrayOfCompact("connectedUsersFlat", flatUsers.toArray(new User[0]));

        // Flatten List<List<Integer>> into a single list and store nested sizes
        List<Integer> flatVotes = new ArrayList<>();
        List<Integer> voteGroupSizes = new ArrayList<>();
        if (session.getVotes() != null) {
            for (List<Integer> group : session.getVotes()) {
                voteGroupSizes.add(group.size());
                flatVotes.addAll(group);
            }
        }
        writer.writeArrayOfInt32("voteGroupSizes", voteGroupSizes.stream().mapToInt(i -> i).toArray());
        writer.writeArrayOfInt32("votesFlat", flatVotes.stream().mapToInt(i -> i).toArray());

        // Write GameState (Compact)
        writer.writeCompact("gameState", session.getGameState());
    }

    @Override
    public GameSession read(CompactReader reader) {
        GameSession.GameSessionBuilder builder = GameSession.builder();

        String statusStr = reader.readString("status");
        builder.status(statusStr != null ? sessionStatus.valueOf(statusStr) : null);

        String sessionIdStr = reader.readString("sessionId");
        builder.sessionId(sessionIdStr != null ? UUID.fromString(sessionIdStr) : null);

        builder.gameName(reader.readString("gameName"));
        builder.maxPlayers(reader.readInt32("maxPlayers"));
        builder.password(reader.readString("password"));
        builder.votingStartTime(reader.readInt64("votingStartTime"));
        builder.voiceChatEnabled(reader.readBoolean("voiceChatEnabled"));

        // Reconstruct connectedUsers
        int[] userGroupSizes = reader.readArrayOfInt32("userGroupSizes");
        User[] flatUsers = reader.readArrayOfCompact("connectedUsersFlat", User.class);
        List<List<User>> connectedUsers = new ArrayList<>();
        int userIndex = 0;
        for (int size : userGroupSizes) {
            List<User> group = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                group.add(flatUsers[userIndex++]);
            }
            connectedUsers.add(group);
        }
        builder.connectedUsers(connectedUsers);

        // Reconstruct votes
        int[] voteGroupSizes = reader.readArrayOfInt32("voteGroupSizes");
        int[] flatVotes = reader.readArrayOfInt32("votesFlat");
        List<List<Integer>> votes = new ArrayList<>();
        int voteIndex = 0;
        for (int size : voteGroupSizes) {
            List<Integer> group = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                group.add(flatVotes[voteIndex++]);
            }
            votes.add(group);
        }
        builder.votes(votes);

        builder.gameState(reader.readCompact("gameState"));

        return builder.build();
    }
}
