<script setup>
import './Footer.css'
</script>


<template>
    <footer class="site-footer">
        <!-- ——— bloc principal ——— -->
        <div class="footer-inner">
            <!-- colonne logo + nav -->
            <div class="footer-left">
                <a class="footer-logo" href="#">
                    <!-- même logo que dans le header -->
                    <img src="../../assets/logo.svg" alt="FTMO" />
                </a>

                <ul class="footer-nav">
                    <li><a href="#"><img src="../../assets/icons/home 1.svg" />Accueil</a></li>
                    <li><a href="#"><img src="../../assets/icons/calendar-lines 1.svg" />Calendrier</a></li>
                    <li><a href="#"><img src="../../assets/icons/question-mark-circle 1.svg" />À&nbsp;propos</a></li>
                    <li><a href="#"><img src="../../assets/icons/chat-lines 1.svg" />Contact</a></li>
                </ul>
            </div>
        </div>

        <!-- ——— bas de page (legal) ——— -->
        <div class="footer-bottom">
            <a href="#">Plan du site</a>
            <a href="#">Mentions légales</a>
            <a href="#">Politique de protection des données personnelles</a>
        </div>
    </footer>
</template>
