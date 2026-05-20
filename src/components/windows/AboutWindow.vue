<template>
  <div class="about-app">
    <div class="about-header">
      <img src="/YanisLaribi-Portfolio/images/icons/user.svg" class="about-avatar" />
      <div class="about-title">
        <h2>Yanis Laribi</h2>
        <p class="about-subtitle">Software Engineering Student • Université Laval</p>
      </div>
    </div>
    <div class="about-body">
      <p class="about-paragraph first-letter">I grew up in Algeria and came to Canada when I was six. One bedroom for three people, no table to eat at, and a country where the language was a mystery to my eyes. But my father had kept his laptop from Algeria, and that changed everything. Every free moment I had, I was in front of that screen. I didn't know it then, but that's where my obsession with technology quietly took root.</p>

      <p class="about-paragraph">Little after, in high school, a teacher introduced me to Scratch. The moment I moved that cartoon cat across the screen, something clicked. I remember thinking: <em>That I was limitless, and I could do anything (yes at 12 years old a simple cartoon cat made me feel that)</em> <span class="about-sidenote">(Data structures, algorithms, statistics and probabilities were still somewhere over the horizon... they'd show up soon enough.)</span></p>

      <p class="about-paragraph">That conviction never left me. When it came time to choose a path, Software Engineering was the only natural answer. Since then, I've been pushing myself forward with an unlimited curiosity and a perseverance that was forged long before university...</p>

      <p class="about-paragraph">Outside of code, I lift weights, play sports, and travel whenever I can. The gym keeps me sane. Travelling keeps me humble. And sports remind me that losing is fine, as long as you show up again the next day. Which, honestly, applies to programming too.</p>

      <p class="about-paragraph">Anyway, I hope you know me a little better now. Feel free to reach out!.</p>

    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
/* About App Styles */
.about-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: "Segoe UI", Tahoma, sans-serif;
  margin: -20px;
  background: #f8f9fa;
}

.about-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(to bottom, #ffffff, #e1eaf5);
  border-bottom: 1px solid #99b4d1;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
}

.about-header::after {
  content: '';
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.2) 100%);
  pointer-events: none;
}

.about-avatar {
  width: 64px;
  height: 64px;
  margin-right: 20px;
  background: transparent;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
}

.about-title h2 {
  margin: 0 !important;
  color: #003399 !important;
  font-size: 24px !important;
  font-weight: 600;
  text-shadow: 1px 1px 0px #fff;
  border: none !important;
  padding-bottom: 0 !important;
}

.about-subtitle {
  margin: 2px 0 4px 0;
  color: #555;
  font-size: 13px;
  font-weight: 500;
}

.about-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 6px;
}

.about-tag {
  background: #dce8f5;
  border: 1px solid #b0cde8;
  color: #1a4273;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.about-body {
  padding: 25px 30px;
  flex: 1;
  overflow-y: auto;
  background: #fff;
  line-height: 1.7;
  color: #2b2b2b;
}

.about-paragraph {
  margin-bottom: 20px;
  font-size: 14px;
  text-align: justify;
}

.about-paragraph.first-letter::first-letter {
  font-size: 42px;
  font-weight: bold;
  color: #003399;
  float: left;
  line-height: 0.8;
  margin-right: 8px;
  margin-top: 4px;
  font-family: "Georgia", serif;
}

.about-sidenote {
  color: #666;
  font-style: italic;
  font-size: 13px;
}

.about-quote {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border-left: 4px solid #003399;
  margin: 20px 0;
  background: #f4f8fc;
  padding: 14px 18px;
  border-radius: 0 4px 4px 0;
}

.about-quote-mark {
  font-size: 48px;
  line-height: 1;
  color: #003399;
  opacity: 0.3;
  font-family: "Georgia", serif;
  margin-top: -10px;
  flex-shrink: 0;
}

.about-quote-text {
  font-style: italic;
  color: #1a4273;
  font-size: 14px;
  line-height: 1.7;
}

.about-skills {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e5e5e5;
}

.about-skill-title {
  font-size: 12px;
  font-weight: 600;
  color: #444;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.about-skill-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.about-skill-pill {
  background: linear-gradient(to bottom, #f5f5f5, #e8e8e8);
  border: 1px solid #c5c5c5;
  border-radius: 12px;
  padding: 4px 12px;
  font-size: 12px;
  color: #333;
  cursor: default;
  transition: all 0.15s;
}

.about-skill-pill:hover {
  background: linear-gradient(to bottom, #eaf6fd, #bee6fd);
  border-color: #3c7fb1;
  color: #003399;
}
</style>
