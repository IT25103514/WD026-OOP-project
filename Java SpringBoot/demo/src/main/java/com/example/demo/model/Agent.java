package com.example.demo.model;

public class Agent {
    private String name;
    private String mobile;
    private String email;
    private String serviceArea;
    private String specializations;
    private String password;
    private String profilePicture; // Added property

    // Default constructor
    public Agent() {}

    // Parameterized constructor
    public Agent(String name, String mobile, String email, String serviceArea, String specializations, String password, String profilePicture) {
        this.name = name;
        this.mobile = mobile;
        this.email = email;
        this.serviceArea = serviceArea;
        this.specializations = specializations;
        this.password = password;
        this.profilePicture = profilePicture;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getServiceArea() { return serviceArea; }
    public void setServiceArea(String serviceArea) { this.serviceArea = serviceArea; }

    public String getSpecializations() { return specializations; }
    public void setSpecializations(String specializations) { this.specializations = specializations; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
}