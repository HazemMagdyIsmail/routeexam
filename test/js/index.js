let isOpen = false;

const toggleBtn = document.querySelector(".strip-toggel-menu");
const navMenu = document.querySelector(".nav-tab-menu");
const headerNav = document.querySelector(".strip-header-nav");
const menuItems = navMenu.querySelectorAll("li");
const menuIcon = toggleBtn.querySelector("i");

const row = document.querySelector(".row");
const homeBtn = document.getElementById("home");

toggleBtn.addEventListener("click", () => {
    if (!isOpen) {
        navMenu.classList.add("open-menu");
        headerNav.classList.add("shift");
        menuIcon.classList.remove("fa-align-justify");
        menuIcon.classList.add("fa-times");
        menuItems.forEach((li, index) => {
            li.style.transitionDelay = `${0.1 + index * 0.05}s`;
        });
        isOpen = true;
    } else {
        navMenu.classList.remove("open-menu");
        headerNav.classList.remove("shift");
        menuIcon.classList.remove("fa-times");
        menuIcon.classList.add("fa-align-justify");
        menuItems.forEach(li => {
            li.style.transitionDelay = `0s`;
        });
        isOpen = false;
    }
});

async function fetchByLetter(letter) {
    try {
        const url = `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.meals) {
            displayMeals(data.meals);
        } else {
            row.innerHTML = `<p class="text-light fs-18">No meals found starting with "${letter.toUpperCase()}"</p>`;
        }
    } catch (error) {
        console.error("Error fetching meals by letter:", error);
    }
}

async function fetchByName(name) {
    try {
        const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.meals) {
            displayMeals(data.meals);
        } else {
            row.innerHTML = `<p class="text-light fs-18">No meals found for "${name}"</p>`;
        }
    } catch (error) {
        console.error("Error fetching meals by name:", error);
    }
}

function displayMeals(results) {
    let box = '';
    for (let i = 0; i < 20; i++) {
        if (!results[i]) break;
        const item = results[i];

        box += `
        <div class="col-md-3">
            <div class="post" meal-id="${item.idMeal}">
                <img src="${item.strMealThumb}" alt="${item.strMeal}" class="w-100">
                <div class="overlay">
                    <h3 class="caption">${item.strMeal}</h3>
                </div>
            </div>
        </div>`;
    }
    row.innerHTML = box;
    attachMealClickEvents();
}

if (homeBtn) {
    homeBtn.addEventListener("click", () => {
        const details = document.getElementById("meal-details");
        details.classList.add("d-none");
        details.innerHTML = "";
        const searchSection = document.getElementById("search-section");
        if (searchSection) searchSection.classList.add("d-none");
        row.classList.remove("d-none");
        fetchByName('');
    });
}

document.addEventListener("DOMContentLoaded", () => {
    fetchByName('');
});

const letterBtns = document.querySelectorAll("[data-letter]");
letterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const letter = btn.dataset.letter;
        fetchByLetter(letter);
    });
});

function attachMealClickEvents() {
    document.querySelectorAll(".post").forEach(post => {
        post.addEventListener("click", () => {
            const mealID = post.getAttribute("meal-id");
            loadMealDetails(mealID);
        });
    });
}

async function loadMealDetails(id) {
    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.meals) showMealDetails(data.meals[0]);
}

function showMealDetails(meal) {
    row.classList.add("d-none");
    const details = document.getElementById("meal-details");
    details.classList.remove("d-none");

    let box1 = `
        <div class="card bg-black text-light px-5">
            <div class="row g-0">
                <div class="col-md-3 offset-1">
                    <img src="${meal.strMealThumb}" class="img-fluid rounded-4 h-100 object-fit-cover" alt="${meal.strMeal}">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                    <h2 class="card-title fw-bold">${meal.strMeal}</h2>
                    <h5 class="mt-3">Instructions:</h5>
                        <p class="card-text">${meal.strInstructions}</p>
                        <p class="card-text mb-1"><strong>Category:</strong> ${meal.strCategory}</p>
                        <p class="card-text mb-3"><strong>Area:</strong> ${meal.strArea}</p>
                        <h5 class="mt-4">Ingredients:</h5>
                        <div class="d-flex flex-wrap gap-2 mb-4">
    `;

    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") {
            box1 += `<span class="ingredient-box">${measure} ${ingredient}</span>`;
        }
    }

    box1 += `
                        </div>
                        <h5>Tags:</h5>
                        <div class="d-flex gap-2">
    `;

    if (meal.strSource) {
        box1 += `<a href="${meal.strSource}" target="_blank" class="tag-box bg-success text-decoration-none">Source</a>`;
    }
    if (meal.strYoutube) {
        box1 += `<a href="${meal.strYoutube}" target="_blank" class="tag-box bg-danger text-decoration-none">YouTube</a>`;
    }

    box1 += `
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    details.innerHTML = box1;
}

const searchBtn = document.getElementById("search");
const searchSection = document.getElementById("search-section");
const searchNameInput = document.getElementById("search-name");
const searchLetterInput = document.getElementById("search-letter");

searchBtn.addEventListener("click", () => {
    row.classList.add("d-none");
    const details = document.getElementById("meal-details");
    if (details) details.classList.add("d-none");
    searchSection.classList.remove("d-none");
});

searchNameInput.addEventListener("input", () => {
    const name = searchNameInput.value.trim();
    const letter = searchLetterInput.value.trim();
    if (name && !letter) {
        fetchByName(name);
        row.classList.remove("d-none");
    }
});

searchLetterInput.addEventListener("input", () => {
    const name = searchNameInput.value.trim();
    const letter = searchLetterInput.value.trim();
    if (letter && !name) {
        fetchByLetter(letter);
        row.classList.remove("d-none");
    }
});

const contactBtn = document.getElementById("contact");
const contactSection = document.getElementById("contact-section");
const contactForm = document.getElementById("contact-form");
const submitBtn2 = document.getElementById("contact-submit");

contactBtn.addEventListener("click", () => {
    row.classList.add("d-none");
    document.getElementById("meal-details")?.classList.add("d-none");
    document.getElementById("search-section")?.classList.add("d-none");
    contactSection.classList.remove("d-none");
});

const contactName = document.getElementById("contact-name");
const contactEmail = document.getElementById("contact-email");
const contactPhone = document.getElementById("contact-phone");
const contactAge = document.getElementById("contact-age");
const contactPassword = document.getElementById("contact-password");
const contactRePassword = document.getElementById("contact-repassword");

const nameRegex = /^[A-Za-z ]{3,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10,15}$/;
const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

function validateContactForm() {
  const validName = nameRegex.test(contactName.value.trim());
  const validEmail = emailRegex.test(contactEmail.value.trim());
  const validPhone = phoneRegex.test(contactPhone.value.trim());
  const validAge = Number(contactAge.value) >= 10 && Number(contactAge.value) <= 100;
  const validPass = passRegex.test(contactPassword.value.trim());
  const validRePass = contactRePassword.value.trim() === contactPassword.value.trim() && contactRePassword.value.trim() !== "";

  toggleClass(contactName, validName);
  toggleClass(contactEmail, validEmail);
  toggleClass(contactPhone, validPhone);
  toggleClass(contactAge, validAge);
  toggleClass(contactPassword, validPass);
  toggleClass(contactRePassword, validRePass);

  submitBtn2.disabled = !(validName && validEmail && validPhone && validAge && validPass && validRePass);
}

function toggleClass(input, isValid) {
  input.classList.remove("is-valid", "is-invalid");
  if (input.value.trim() === "") return;
  input.classList.add(isValid ? "is-valid" : "is-invalid");
}

contactForm.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", validateContactForm);
});
