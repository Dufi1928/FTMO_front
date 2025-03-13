<script setup>
import Header from '../components/Header/Header.vue'
import './index.css'
</script>


<template>
    <Header/>
    <div class="hero-banner">
        <img src="../assets/images/section-hero.png" alt="">
    </div>
    <div class="hero-content-container">
        <div class="hero-content">
            <h1 class="hero-content-title">Le Tennis de table dans
                la Métropole Lilloise</h1>
            <a class="hero-content-cta" href="#">Découvrez nos clubs</a>
        </div>
    </div>
    <div class="our-history-container">
        <div class="our-history-content">
            <h2 class="our-history-content-title">Notre histoire, notre force</h2>
            <p class="our-history-content-content">
                La Fédération de Tennis de Table de la Métropole Lilloise (FTMO) rassemble les clubs de tennis de table de Lille et de ses environs. Depuis plus de 50 ans, nous œuvrons pour développer ce sport, former les jeunes talents et organiser des compétitions de qualité.
            </p>
            <p class="our-history-content-content">
                Notre mission est de promouvoir les valeurs sportives, l'esprit d'équipe et la pratique du tennis de table pour tous, quel que soit l'âge ou le niveau.
            </p>
            <a href="" class="our-history-content-content-cta">En savoir plus</a>
        </div>
    </div>
    <div class="images-grid-container">
        <img src="../assets/images/grid.jpg" alt="">
    </div>
</template>

