package com.example.demo.controller;

import com.example.demo.model.Agent;
import com.example.demo.model.AgentLoginRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

@RestController
@CrossOrigin(origins = "*")// Allow request  from any frontend
public class AgentloginController {

    private static final String FILE_PATH = "agents.txt";



    @PostMapping("/login-agent")
    public ResponseEntity<String> loginAgent(@RequestBody AgentLoginRequest loginRequest) {
        //1 get email and password from request
        String emailInput = loginRequest.getEmail();
        String passwordInput = loginRequest.getPassword();

        //2.validate the both fields are provided
        if (emailInput == null || emailInput.isEmpty() || passwordInput == null || passwordInput.isEmpty()) {
            return new ResponseEntity<>("Please enter both email and password.", HttpStatus.BAD_REQUEST);
        }

        boolean isAuthenticated = false;

       //3.read agent.txt and check credentials
        try (BufferedReader reader = new BufferedReader(new FileReader(FILE_PATH))) {
            String line;
            String fileEmail = "";
            String filePassword = "";


            while ((line = reader.readLine()) != null) {
                line = line.trim();

                // Extract email from line
                if (line.startsWith("Email")) {
                    fileEmail = line.substring(line.indexOf(":") + 1).trim();
                // Extract password from line
                } else if (line.startsWith("Password")) {
                    filePassword = line.substring(line.indexOf(":") + 1).trim();
                }

                //check if both email and password matcch
                if (!fileEmail.isEmpty() && !filePassword.isEmpty()) {
                    if (fileEmail.equalsIgnoreCase(emailInput) && filePassword.equals(passwordInput)) {
                        isAuthenticated = true;
                        break;//stop searching once found
                    }
                }

                //Reset variables when rearching the end of a record
                if (line.startsWith("====")) {
                    fileEmail = "";
                    filePassword = "";
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error reading agent registry data.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        //4.Return response based on authentication result
        if (isAuthenticated) {
            return new ResponseEntity<>("Login successful", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Invalid email or password! Please try again.", HttpStatus.UNAUTHORIZED);
        }
    }
}