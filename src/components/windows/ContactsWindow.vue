<template>
  <div class="contacts-app">
    <div class="contacts-header">
      <img src="/YanisLaribi-Portfolio/images/icons/ContactIcone.webp" class="contacts-header-icon" />
      <div class="contacts-header-text">
        <h2>Contact Yanis</h2>
        <p>Let's get in touch!</p>
      </div>
    </div>
    <div class="contacts-body">
      <div class="contacts-info">
        <div class="contact-item"><strong>Email:</strong> yanis.laribi.1@ulaval.ca</div>
        <div class="contact-item"><strong>Phone:</strong> 418-264-7838</div>
        <div class="contact-item"><strong>LinkedIn:</strong> linkedin.com/in/yanislaribi</div>
        <div class="contact-item"><strong>GitHub:</strong> github.com/YanisLaribi</div>
      </div>
      <form class="contacts-form" @submit.prevent="sendMail">
        <h3>Send an Email</h3>
        <div class="form-group">
          <label>Subject:</label>
          <input type="text" v-model="mailSubject" class="win7-input" placeholder="Enter subject..." required />
        </div>
        <div class="form-group">
          <label>Message:</label>
          <textarea v-model="mailBody" class="win7-textarea" placeholder="Type your message here..." required></textarea>
        </div>
        <button type="submit" class="win7-button send-btn">Send Email via Default Client</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const mailSubject = ref('')
const mailBody = ref('')

function sendMail() {
  window.open(`mailto:yanis.laribi.1@ulaval.ca?subject=${encodeURIComponent(mailSubject.value)}&body=${encodeURIComponent(mailBody.value)}`, '_blank')
}
</script>

<style scoped>
/* Contacts App Styles */
.contacts-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: "Segoe UI", Tahoma, sans-serif;
  margin: -20px; /* offset the default .window-body padding */
}

.contacts-header {
  display: flex;
  align-items: center;
  background: linear-gradient(to bottom, #f9f9f9, #e0e0e0);
  padding: 15px;
  border-bottom: 1px solid #ccc;
}

.contacts-header-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
  margin-right: 15px;
}

.contacts-header-text h2 {
  margin: 0 !important;
  color: #003399;
  font-size: 18px;
  border: none !important;
  padding-bottom: 0 !important;
}

.contacts-header-text p {
  margin: 0;
  color: #666;
  font-size: 12px;
}

.contacts-body {
  padding: 15px;
  flex: 1;
  overflow-y: auto;
  background: #fff;
}

.contacts-info {
  background: #f0f4f9;
  border: 1px solid #d9d9d9;
  border-radius: 3px;
  padding: 10px;
  margin-bottom: 15px;
}

.contact-item {
  font-size: 13px;
  color: #333;
  margin-bottom: 5px;
}

.contacts-form h3 {
  color: #003399;
  font-size: 14px;
  margin-top: 0;
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 5px;
}

.form-group {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 12px;
  color: #333;
  margin-bottom: 3px;
}

.win7-input, .win7-textarea {
  border: 1px solid #abadb3;
  border-radius: 2px;
  padding: 4px 6px;
  font-family: "Segoe UI", Tahoma, sans-serif;
  font-size: 13px;
  outline: none;
}

.win7-input:focus, .win7-textarea:focus {
  border-color: #569de5;
}

.win7-textarea {
  resize: vertical;
  min-height: 80px;
}

.win7-button {
  background: linear-gradient(to bottom, #f2f2f2 0%, #ebebeb 50%, #dddddd 51%, #cfcfcf 100%);
  border: 1px solid #707070;
  border-radius: 3px;
  padding: 4px 15px;
  font-family: "Segoe UI", Tahoma, sans-serif;
  font-size: 12px;
  color: #000;
  cursor: pointer;
  display: inline-block;
}

.win7-button:hover {
  background: linear-gradient(to bottom, #eaf6fd 0%, #d9f0fc 50%, #bee6fd 51%, #a7d9f5 100%);
  border-color: #3c7fb1;
}

.win7-button:active {
  background: linear-gradient(to bottom, #e5f4fc 0%, #c4e5fa 50%, #98d1ef 51%, #68b3db 100%);
  border-color: #2c628b;
}

.send-btn {
  margin-top: 5px;
}
</style>
