package org.example.codenames.hazelcast.compactSerializers.gameSessionSerializers;

import com.hazelcast.nio.serialization.compact.*;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.entity.dto.UserRoomLobbyDTO;

import java.util.List;

public class UserCompactSerializer implements CompactSerializer<UserRoomLobbyDTO> {

    @Override
    public String getTypeName() {
        return "User";
    }

    @Override
    public Class<UserRoomLobbyDTO> getCompactClass() {
        return UserRoomLobbyDTO.class;
    }

    @Override
    public void write(CompactWriter writer, UserRoomLobbyDTO user) {
        writer.writeString("id", user.getId());
        writer.writeString("username", user.getUsername());
        writer.writeInt32("profilePic", user.getProfilePic());
        writer.writeString("status", user.getStatus() != null ? user.getStatus().name() : null);
    }

    @Override
    public UserRoomLobbyDTO read(CompactReader reader) {
        return UserRoomLobbyDTO.builder()
                .id(reader.readString("id"))
                .username(reader.readString("username"))
                .profilePic(reader.readInt32("profilePic"))
                .status(reader.readString("status") != null ? User.userStatus.valueOf(reader.readString("status")) : null)
                .build();
    }
}
