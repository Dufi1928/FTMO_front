<script setup>
import Header from '../../components/Header/Header.vue'
import Footer from '../../components/Footer/Footer.vue'
import './Runks.css'
import {useAuthStore} from '../../../stores/auth.js'
const auth = useAuthStore()
import MainPageTitle from "../../components/MainPageTitle/MainPageTitle.vue";

import { ref, computed, onMounted } from 'vue'


</script>

<template>
    <Header theme="light" :key="auth.renderKey" :alwaysBlack="true"/>
    <main>

    </main>
    <Footer/>
</template>
