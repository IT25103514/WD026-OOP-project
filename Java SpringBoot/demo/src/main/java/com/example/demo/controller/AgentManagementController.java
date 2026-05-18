package com.example.demo.controller;

import com.example.demo.model.Agent;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/agents")
public class AgentManagementController {

    private static final String FILE_PATH = "agents.txt";
    private static final String UPLOAD_DIR = "profile_pictures";

    // ─── GET ALL AGENTS (For Management Panel Table) ───
    @GetMapping
    public ResponseEntity<List<Agent>> getAllAgents() {
        List<Agent> agents = loadAllAgentsFromFile();
        return new ResponseEntity<>(agents, HttpStatus.OK);
    }

    // ─── FETCH SINGLE AGENT PROFILE (For Update Settings View) ───
    @GetMapping("/get-profile")
    public ResponseEntity<?> getAgentProfile(@RequestParam String email) {
        if (email == null || email.trim().isEmpty()) {
            return new ResponseEntity<>("Email parameter is missing", HttpStatus.BAD_REQUEST);
        }

        List<Agent> agents = loadAllAgentsFromFile();
        for (Agent a : agents) {
            if (a.getEmail() != null && a.getEmail().equalsIgnoreCase(email.trim())) {
                return new ResponseEntity<>(a, HttpStatus.OK);
            }
        }
        return new ResponseEntity<>("Agent profile not found", HttpStatus.NOT_FOUND);
    }

    // ─── UPDATE AGENT DETAILS FROM MANAGEMENT PANEL OR PROFILE UPDATE ───
    @PutMapping("/{email}")
    public ResponseEntity<String> updateAgentProfile(@PathVariable String email, @RequestBody Agent updatedAgent) {
        List<Agent> agents = loadAllAgentsFromFile();
        boolean found = false;

        for (int i = 0; i < agents.size(); i++) {
            if (agents.get(i).getEmail().equalsIgnoreCase(email.trim())) {
                // Retain old password if left blank
                if (updatedAgent.getPassword() == null || updatedAgent.getPassword().trim().isEmpty()) {
                    updatedAgent.setPassword(agents.get(i).getPassword());
                }

                // Retain old profile picture if not modified in the current request payload
                if (updatedAgent.getProfilePicture() == null || updatedAgent.getProfilePicture().trim().isEmpty()) {
                    updatedAgent.setProfilePicture(agents.get(i).getProfilePicture());
                }

                updatedAgent.setEmail(agents.get(i).getEmail()); // Keep email consistent
                agents.set(i, updatedAgent);
                found = true;
                break;
            }
        }

        if (found) {
            saveAllToFile(agents);
            return new ResponseEntity<>("Agent updated successfully", HttpStatus.OK);
        }
        return new ResponseEntity<>("Agent not found", HttpStatus.NOT_FOUND);
    }

    // ─── ALIGNED PUT ROUTE FOR PROFILE SETTINGS PAGE EXCLUSIVELY ───
    @PutMapping("/update-profile")
    public ResponseEntity<String> updateAgentProfileSettings(@RequestBody Agent updatedAgent) {
        return updateAgentProfile(updatedAgent.getEmail(), updatedAgent);
    }

    // ─── FILE UPLOADER TO PROFILE_PICTURES FOLDER ───
    @PostMapping("/upload-avatar")
    public ResponseEntity<String> uploadAvatar(@RequestParam("file") MultipartFile file, @RequestParam("email") String email) {
        if (file.isEmpty()) {
            return new ResponseEntity<>("File is missing", HttpStatus.BAD_REQUEST);
        }

        try {
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String originalName = file.getOriginalFilename();
            String ext = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf(".")) : ".png";

            String filename = email.replaceAll("[^a-zA-Z0-9]", "_") + "_profile" + ext;
            Path targetPath = Paths.get(UPLOAD_DIR, filename);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String cleanRelativePath = UPLOAD_DIR + "/" + filename;
            return new ResponseEntity<>(cleanRelativePath, HttpStatus.OK);

        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error handling storage assignment", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ─── DELETE AGENT ───
    @DeleteMapping("/{email}")
    public ResponseEntity<String> deleteAgent(@PathVariable String email) {
        List<Agent> agents = loadAllAgentsFromFile();
        boolean removed = false;

        for (int i = 0; i < agents.size(); i++) {
            if (agents.get(i).getEmail().equalsIgnoreCase(email.trim())) {
                agents.remove(i);
                removed = true;
                break;
            }
        }

        if (removed) {
            saveAllToFile(agents);
            return new ResponseEntity<>("Agent deleted successfully", HttpStatus.OK);
        }
        return new ResponseEntity<>("Agent not found", HttpStatus.NOT_FOUND);
    }

    // ─── READ ALL AGENTS FROM FILE WITH PROFILE PICTURE SUPPORT ───
    private List<Agent> loadAllAgentsFromFile() {
        List<Agent> agents = new ArrayList<>();
        File file = new File(FILE_PATH);
        if (!file.exists()) return agents;

        try (BufferedReader reader = new BufferedReader(new FileReader(FILE_PATH))) {
            String line;
            Agent current = null;

            while ((line = reader.readLine()) != null) {
                line = line.trim();

                if (line.startsWith("====")) {
                    if (current != null) {
                        if (current.getEmail() != null && !current.getEmail().isEmpty()) {
                            agents.add(current);
                        }
                        current = null;
                    }
                    continue;
                }

                if (current == null) {
                    current = new Agent();
                }

                if (line.contains(":")) {
                    String key = line.substring(0, line.indexOf(":")).trim();
                    String value = line.substring(line.indexOf(":") + 1).trim();

                    if (key.equalsIgnoreCase("Name")) current.setName(value);
                    else if (key.equalsIgnoreCase("Mobile")) current.setMobile(value);
                    else if (key.equalsIgnoreCase("Email")) current.setEmail(value);
                    else if (key.equalsIgnoreCase("Service Area")) current.setServiceArea(value);
                    else if (key.equalsIgnoreCase("Specialization")) current.setSpecializations(value);
                    else if (key.equalsIgnoreCase("Password")) current.setPassword(value);
                    else if (key.equalsIgnoreCase("ProfilePicture")) current.setProfilePicture(value); // Reads image paths now!
                }
            }

            if (current != null && current.getEmail() != null && !current.getEmail().isEmpty()) {
                agents.add(current);
            }

        } catch (IOException e) {
            System.out.println("Error reading agent registry: " + e.getMessage());
        }
        return agents;
    }

    // ─── WRITE ALL AGENTS TO FILE WITH PROFILE PICTURE SUPPORT ───
    private void saveAllToFile(List<Agent> agents) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(FILE_PATH, false))) {
            for (Agent a : agents) {
                writer.write(String.format(
                        "========================================%n" +
                                "Name           : %s%n" +
                                "Mobile         : %s%n" +
                                "Email          : %s%n" +
                                "Service Area   : %s%n" +
                                "Specialization : %s%n" +
                                "Password       : %s%n" +
                                "ProfilePicture : %s%n" +
                                "========================================%n%n",
                        safe(a.getName()),
                        safe(a.getMobile()),
                        safe(a.getEmail()),
                        safe(a.getServiceArea()),
                        safe(a.getSpecializations()),
                        safe(a.getPassword()),
                        safe(a.getProfilePicture()) // Writes paths down safely!
                ));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private String safe(String value) {
        return value != null ? value : "";
    }
}