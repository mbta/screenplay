# Outfront Emergency Takeover Tool

This tool allows OIOs to take over all OutFront Media-owned DUP ("landscape")
and Triptych ("portrait") displays in any station with either a pre-written or
custom message, for use in emergency situations (in particular when Live PA is
not available).

The outline of how it works:

1. User enters station targeting and message details into the tool
2. The client either selects a pre-made image or uses Canvas to generate an
   image with custom text, then sends the image data to the server
3. The server uploads the image data to an OutFront-owned SFTP server
4. The existence of an image file in a station's corresponding folder on the
   SFTP server causes all relevant screens to display that image, instead of
   whatever content they would normally rotate through


### Testing job

We run a daily automated test (`TakeoverToolTestingJob`) that confirms we can
upload and delete files on the SFTP server, and everything is where we expect
it to be. If not, it logs an error.


### Server access

For testing or inspecting the file system, you can connect to the SFTP server
using the same credentials the app does.

> ⚠️ **Use caution** as this is a production environment; there is no separate
> "test server". Changes to the file system will affect live screens. The only
> exception is the `MBTA-TEST` directories which are designated for our testing
> and not linked to any screens.

1. Locate the "Outfront SFTP Server" item in the Screens vault in 1Password.
   This contains a copy of the server domain and username, plus the SSH private
   key required to connect.

2. If you haven't set up the 1Password SSH agent, or it isn't allowed access to
   the Screens vault, you'll see a callout at the top of the item to address
   this. (Note this callout may not update "live" as you change configuration;
   navigate to a different item and back to refresh it. When you see no callout,
   everything should be ready.)

3. Connect to the server using `sftp username@domain`. If the SSH agent is set
   up correctly, you should get a prompt from 1Password to use the Outfront
   private key. Authorize this and you should see an `sftp>` prompt indicating
   you are now connected. Enter `?` or `help` for a command reference.
