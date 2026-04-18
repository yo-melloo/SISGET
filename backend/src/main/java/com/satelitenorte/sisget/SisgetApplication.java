package com.satelitenorte.sisget;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
@org.springframework.cache.annotation.EnableCaching
public class SisgetApplication {

	public static void main(String[] args) {
		SpringApplication.run(SisgetApplication.class, args);
	}

}
