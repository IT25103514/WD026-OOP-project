package com.example.demo.controller;

import com.example.demo.model.Agent;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;

@RestController
@CrossOrigin(origins = "*") // To connect with the frontend UI without any issues
public class AgentController {

    private static final String FILE_PATH = "agents.txt";

    @PostMapping("/register-agent")
    public ResponseEntity<String> registerAgent(@RequestBody Agent agent) {
        // Validation check (check if the basic data is present)
        if (agent.getName() == null || agent.getName().isEmpty() ||
                agent.getEmail() == null || agent.getEmail().isEmpty() ||
                agent.getPassword() == null || agent.getPassword().isEmpty()) {
            return new ResponseEntity<>("Required fields are missing!", HttpStatus.BAD_REQUEST);
        }

        // format the data properly so it can be saved in a single record
        String agentRecord = String.format(
                "========================================%n" +
                        "Name           : %s%n" +
                        "Mobile         : %s%n" +
                        "Email          : %s%n" +
                        "Service Area   : %s%n" +
                        "Specialization : %s%n" +
                        "Password       : %s%n" +
                        "========================================%n%n",
                agent.getName(),
                agent.getMobile(),
                agent.getEmail(),
                agent.getServiceArea(),
                agent.getSpecializations(),
                agent.getPassword()
        );

        // save the data to the agent.txt file
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(FILE_PATH, true))) {
            writer.write(agentRecord);
            return new ResponseEntity<>("Agent registered successfully and saved to file!", HttpStatus.OK);
        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error saving agent data to server file.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}