package com.shopifygenie.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

@Component
public class WebhookValidator {
    
    private static final Logger logger = LoggerFactory.getLogger(WebhookValidator.class);
    private static final String HMAC_SHA256 = "HmacSHA256";
    
    @Value("${shopify.webhook-secret}")
    private String webhookSecret;
    
    public boolean validateWebhook(String body, String hmacHeader) {
        if (body == null || hmacHeader == null) {
            logger.warn("Webhook validation failed: body or hmac header is null");
            return false;
        }
        
        try {
            String calculatedHmac = calculateHmac(body);
            return hmacHeader.equals(calculatedHmac);
        } catch (Exception e) {
            logger.error("Error validating webhook HMAC", e);
            return false;
        }
    }
    
    private String calculateHmac(String data) throws NoSuchAlgorithmException, InvalidKeyException {
        Mac mac = Mac.getInstance(HMAC_SHA256);
        SecretKeySpec secretKeySpec = new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
        mac.init(secretKeySpec);
        
        byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return bytesToHex(hmacBytes);
    }
    
    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}
