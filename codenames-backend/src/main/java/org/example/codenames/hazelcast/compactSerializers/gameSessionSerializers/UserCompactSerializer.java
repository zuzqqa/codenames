package org.example.codenames.hazelcast.compactSerializers.gameSessionSerializers;

import com.hazelcast.nio.serialization.compact.CompactReader;
import com.hazelcast.nio.serialization.compact.CompactSerializer;
import com.hazelcast.nio.serialization.compact.CompactWriter;
import org.example.codenames.user.entity.User;

import java.util.List;

/**
 * Compact serializer for the User class.
 */
public class UserCompactSerializer implements CompactSerializer<User> {

    /**
     * Returns the type name for the User class.
     *
     * @return the type name "User"
     */
    @Override
    public String getTypeName() {
        return "User";
    }

    /**
     * Returns the User class.
     *
     * @return the User class
     */
    @Override
    public Class<User> getCompactClass() {
        return User.class;
    }

    /**
     * Writes a User object to the CompactWriter.
     *
     * @param writer the CompactWriter to write to
     * @param user   the User object to write
     */
    @Override
    public void write(CompactWriter writer, User user) {
        writer.writeString("id", user.getId());
        writer.writeString("username", user.getUsername());
        writer.writeString("password", user.getPassword());
        writer.writeString("email", user.getEmail());
        writer.writeString("description", user.getDescription());
        writer.writeInt32("profilePic", user.getProfilePic());
        writer.writeString("roles", user.getRoles());
        writer.writeBoolean("isGuest", user.isGuest());
        writer.writeString("status", user.getStatus() != null ? user.getStatus().name() : null);
        writer.writeArrayOfString("friends", user.getFriends().toArray(new String[0]));
        writer.writeArrayOfString("sentRequests", user.getSentRequests().toArray(new String[0]));
        writer.writeArrayOfString("receivedRequests", user.getReceivedRequests().toArray(new String[0]));
    }

    /**
     * Reads a User object from the CompactReader.
     *
     * @param reader the CompactReader to read from
     * @return the User object read from the reader
     */
    @Override
    public User read(CompactReader reader) {
        return User.builder()
                .id(reader.readString("id"))
                .username(reader.readString("username"))
                .password(reader.readString("password"))
                .email(reader.readString("email"))
                .description(reader.readString("description"))
                .profilePic(reader.readInt32("profilePic"))
                .roles(reader.readString("roles"))
                .isGuest(reader.readBoolean("isGuest"))
                .status(reader.readString("status") != null ? User.userStatus.valueOf(reader.readString("status")) : null)
                .friends(List.of(reader.readArrayOfString("friends")))
                .sentRequests(List.of(reader.readArrayOfString("sentRequests")))
                .receivedRequests(List.of(reader.readArrayOfString("receivedRequests")))
                .build();
    }
}
