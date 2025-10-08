// ===============================
// 🌙 Dark/Light Mode Toggle (Simple Version)
// ===============================

// Create and add theme toggle button
function createThemeToggle() {
  const themeToggle = document.createElement('div');
  themeToggle.className = 'theme-toggle';
  themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  themeToggle.style.cssText = `
    position: fixed;
    top: 50%;
    right: 2rem;
    transform: translateY(-50%);
    z-index: 1000;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 50px;
    padding: 0.75rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  `;
  
  document.body.appendChild(themeToggle);
  return themeToggle;
}

// Initialize theme
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const themeToggle = createThemeToggle();
  const icon = themeToggle.querySelector('i');
  
  // Update icon based on current theme
  function updateIcon() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    icon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    
    // Update button background for dark mode
    if (currentTheme === 'dark') {
      themeToggle.style.background = 'rgba(30, 41, 59, 0.9)';
      themeToggle.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      icon.style.color = '#6366f1';
    } else {
      themeToggle.style.background = 'rgba(255, 255, 255, 0.9)';
      themeToggle.style.borderColor = 'rgba(0, 0, 0, 0.1)';
      icon.style.color = '#6366f1';
    }
  }
  
  updateIcon();
  
  // Toggle theme on click
  themeToggle.addEventListener('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateIcon();
  });

  // Hover effects
  themeToggle.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-50%) scale(1.1)';
    this.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.15)';
  });
  
  themeToggle.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(-50%) scale(1)';
    this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
  });
}

// ===============================
// 🌐 Mobile Menu Toggle (Fixed)
// ===============================
function initMobileMenu() {
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.querySelector("nav ul");
  
  if (!menuToggle || !navLinks) {
    console.log("Menu elements not found");
    return;
  }

  console.log("Mobile menu initialized");

  // Toggle menu function
  function toggleMenu() {
    const isOpen = navLinks.classList.contains("show");
    
    if (isOpen) {
      navLinks.classList.remove("show");
      menuToggle.classList.remove("active");
      document.body.style.overflow = "";
    } else {
      navLinks.classList.add("show");
      menuToggle.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  // Close menu function
  function closeMenu() {
    navLinks.classList.remove("show");
    menuToggle.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Toggle menu on hamburger click
  menuToggle.addEventListener("click", function(e) {
    e.stopPropagation();
    toggleMenu();
    console.log("Menu toggled");
  });

  // Close menu when clicking nav links
  document.querySelectorAll("nav ul li a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  // Close menu when clicking outside
  document.addEventListener("click", function(e) {
    if (!e.target.closest("header")) {
      closeMenu();
    }
  });

  // Close menu on escape key
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      closeMenu();
    }
  });

  // Close menu on window resize if open
  window.addEventListener("resize", function() {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
}

// ===============================
// 📩 Contact Form (Simple Version)
// ===============================
function initContactForm() {
  const form = document.querySelector("#contact form");
  if (!form) return;

  // Create feedback div if it doesn't exist
  if (!document.getElementById("form-feedback")) {
    const feedback = document.createElement("div");
    feedback.id = "form-feedback";
    feedback.className = "form-feedback";
    form.appendChild(feedback);
  }

  const feedback = document.getElementById("form-feedback");

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = form.querySelector("input[name='name']").value.trim();
    const email = form.querySelector("input[name='email']").value.trim();
    const message = form.querySelector("textarea[name='message']").value.trim();
    const submitButton = form.querySelector("button[type='submit']");

    // Reset feedback
    feedback.textContent = "";
    feedback.className = "form-feedback";

    // Validation
    if (!name || !email || !message) {
      feedback.textContent = "⚠️ Please fill in all fields.";
      feedback.className = "form-feedback error";
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      feedback.textContent = "⚠️ Please enter a valid email address.";
      feedback.className = "form-feedback error";
      return;
    }

    // Show loading
    const originalText = submitButton.textContent;
    submitButton.textContent = "Sending...";
    submitButton.disabled = true;

    // Submit to Formspree
    const formData = new FormData(form);
    
    fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        feedback.textContent = `✅ Thanks, ${name}! Your message has been sent successfully.`;
        feedback.className = "form-feedback success";
        form.reset();
        
        setTimeout(() => {
          feedback.textContent = "";
          feedback.className = "form-feedback";
        }, 5000);
      } else {
        throw new Error('Failed to send');
      }
    })
    .catch(error => {
      feedback.textContent = "❌ Sorry, there was an error. Please try again.";
      feedback.className = "form-feedback error";
    })
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
  });
}

// ===============================
// 📱 Header Scroll Effect
// ===============================
function initScrollEffects() {
  const header = document.querySelector("header");
  if (!header) return;

  window.addEventListener("scroll", function() {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

// ===============================
// 🎯 Smooth Scrolling
// ===============================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      
      const target = document.querySelector(href);
      if (target) {
        const offsetTop = target.offsetTop - 80;
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ===============================
// ✨ Simple Animations
// ===============================
function initAnimations() {
  // Only run if Intersection Observer is supported
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Elements to animate
  const elementsToAnimate = [
    '.edu-card',
    '.skill-card', 
    '.exp-card',
    '.card',
    '.update-card',
    '#achievements li'
  ];

  elementsToAnimate.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  });
}

// ===============================
// 🎪 Initialize Everything
// ===============================
function initApp() {
  console.log("🚀 Initializing portfolio...");
  
  try {
    initTheme();
    initMobileMenu();
    initContactForm();
    initScrollEffects();
    initSmoothScroll();
    initAnimations();
    
    console.log("✅ Portfolio initialized successfully!");
  } catch (error) {
    console.error("❌ Error initializing portfolio:", error);
  }
}

// ===============================
// 🏁 Start Everything
// ===============================
// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}