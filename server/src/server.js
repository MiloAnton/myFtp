import { changeDirectory } from './changeDirectory';
import { readDirectory } from './readDirectory';
import { checkPasswd } from './checkPassword';
import { checkUser } from './checkUser';
import { createServer } from "net";

const allSockets= {};
let idSocket = 0;

export function launch(port) {
  const server = createServer((socket) => {
    let newIdSocket = idSocket;
    idSocket++;
    socket.uid = newIdSocket; 
    allSockets[newIdSocket] = '';
    console.log("new connection.");
    socket.on("data", (data) => {
      const message = data.toString();
      const [command, ...args] = message.trim().split(" ");
      console.log(command, args);
      switch (command) {
        case "USER":
          socket.write(checkUser(args, allSockets, socket));
          break;
        case "PASS":  // Checks wether the password is valid for the current user
          socket.write(checkPasswd(args, allSockets, socket))
          break;
        case "PWD":   // Has to return the current position in the servers filesystem
          socket.write(process.cwd() + "\r\n");
          break;
        case "QUIT":  // Disconnects client from server
          socket.write("221 Closing connection \r\n");
          socket.end();
          socket.destroy();
          break;
        case "LIST":  // Similar to ls in Bash, lists files in current folder
          socket.write("\nCurrent directory filenames: \n" + readDirectory());
          break;
        case "CWD":   // Change folder, used to navigate filesystem
          changeDirectory(args);
          socket.write("The folder you're in is now : " + process.cwd() + "\r\n");
          break;
        case "RETR":  // Download a file from server
          socket.write("transfer a copy of the file FILE from the server to the client\r\n")
          break;
        case "STOR":  // Upload a file to server
          socket.write("transfer a copy of the file FILE from the client to the server\r\n")
          break;
        case "HELP":  // Display help information about allowed commands 
          socket.write("\n---------\nThe server handles the following commands:\n---------\nUSER <username>: check if the user exists\nPASS <password>: authenticate the user with a password\nLIST: list the current directory of the server\nCWD <directory>: change the current directory of the server\nRETR <filename>: transfer a copy of the file FILE from the server to the client\nSTOR <filename>: transfer a copy of the file FILE from the client to the server\nPWD: display the name of the current directory of the server\nHELP: send helpful information to the client\nQUIT: close the connection and stop the program\r\n")
          break;
        case "WHOAMI":  // Displays the current connected user
          socket.write(allSockets[socket.uid].toString());
          break;
        default:
          console.log("502 command does not exist :", command, args, "\r\n");
      }
    });
    socket.write("220 Hello World! \r\n");  // Confirms connection with first message to client
  });

  server.listen(port, () => {
    console.log(`server started at localhost:${port}`); // Server-side start-up validator
  });
}