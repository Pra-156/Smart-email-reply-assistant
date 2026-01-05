package com.email.writer.app;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;
    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = WebClient.builder().build();
    }


    public String generateEmailReply (EmailRequest emailRequest)
    {//Build the prompt
        String prompt = buildPrompt(emailRequest);
        //craft request

        Map<String,Object> requestBody=Map.of(
                "contents",new Object[]{
                        Map.of("parts",new Object[]{
                                Map.of("text",prompt)
                        })
                }
        );

        //do request and get response
         String response = webClient.post()
                 .uri(geminiApiUrl +"?key="+ geminiApiKey)
                 .header("Content-Type","application/json")
                 .bodyValue(requestBody)
                 .retrieve()
                 .bodyToMono(String.class)
                 .block();
         //EXtracted response and return
        return extractResponseContent(response);
    }

    private String extractResponseContent(String response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootnode = mapper.readTree(response);
            return rootnode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .get("text")
                    .asText();
        } catch (Exception e) {
            return "error processing request"+e.getMessage();
        }
    }

    public String buildPrompt(EmailRequest emailRequest)
    {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate a professional email reply for the following email content.please don't generate a subject");
        if(emailRequest.getTone()!=null && emailRequest.getTone()!="") {
            prompt.append("use a ").append(emailRequest.getTone()).append("tone. ");
        }
        prompt.append("\nOriginal email:\n").append(emailRequest.getEmailContent());
        return prompt.toString();

    }
}
