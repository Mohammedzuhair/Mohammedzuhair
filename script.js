const mealEl = document.getElementById('meals');
const favcontainer = document.getElementById('fav-meals');

const searchTerm = document.getElementById('search-term');
const searchBtn = document.getElementById('search');

// Recipe detail pop up
const dishpopupEl = document.getElementById('dish-popup');
const dishInfoEl = document.getElementById('dish-info');
const dishpopupCloseBtn = document.getElementById('close-popup');


getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");

    const respData = await resp.json();
    const randomMeal = respData.meals[0];

    loadRandomMeal(randomMeal, true);
}

async function getMealById(id) {
    const resp = await fetch(
        "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
        );
    const respData = await resp.json();

    const mldata = respData.meals[0];

    return mldata;
}


// Function for search
async function getMealsBySearch(term) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + term);

    const respData = await resp.json();
    const meal = respData.meals;

    return meal;


}

function loadRandomMeal(mealData, random = false) {
    
    const meal = document.createElement('div');
    meal.classList.add('meal');

    meal.innerHTML = `
        <div class="meal-header">
            ${ random ? `
            <span class="random">Random Recipe</span>` : '' }
            <img class="mealImage"
                src="${mealData.strMealThumb}" 
                alt="${mealData.strMeal}" 
            />
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
                <i class="fas fa-heart"></i>
            </button> 
        </div>  
    `;

    const btn = meal.querySelector(".meal-body .fav-btn");

    btn.addEventListener("click", () => {
        if(btn.classList.contains("active")) {
            RemoveMealFromLS(mealData.idMeal);
            btn.classList.remove("active");
        } else {
            AddMealToLS(mealData.idMeal);
            btn.classList.add("active");
        }

        fetchFavMeals();
    });

    const img_click = meal.querySelector(".meal-header .mealImage");

    img_click.addEventListener("click", () => {
        DisplayDishDetail(mealData);
    });

    mealEl.appendChild(meal);

}

function AddMealToLS(mealId) {

    const mealIds = getMealsFromLS();
    localStorage.setItem('mealIds',
            JSON.stringify([...mealIds, mealId]));
}

function RemoveMealFromLS(mealId) {

    const mealIds = getMealsFromLS();
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id =>id !== mealId)));
}

function getMealsFromLS() {
   
    const mealIds = JSON.parse(localStorage.
            getItem('mealIds'));

    return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {

    favcontainer.innerHTML="";

    const mealIds = getMealsFromLS();

    const meals = [];

    for(let i = 0; i < mealIds.length; i++)
    {
        const mealid = mealIds[i];
        meal = await getMealById(mealid);
        meals.push(meal);
        
        addMealFav(meal);
    }
}


function addMealFav(mealData) {
    const favMeal = document.createElement('li');
   
    favMeal.innerHTML=`
    <img class="fav-meal-img"
        src="${mealData.strMealThumb}" 
        alt="${mealData.strMeal}"
    />
    
    <span>${mealData.strMeal}</span>
    <button class="clear">
    <i class="fas fa-window-close"></i></button>
    `;

    const btn = favMeal.querySelector(".clear");


    // Event listener for remove the favorite item.
    btn.addEventListener("click", ()=> {
        RemoveMealFromLS(mealData.idMeal);
        fetchFavMeals();
    });

    const fav_img_click = favMeal.querySelector(".fav-meal-img");

    // Event listener to display details of favorite dish.
    fav_img_click.addEventListener("click", () => {
        DisplayDishDetail(mealData);
    });

    favcontainer.appendChild(favMeal);
}

// Display dish detail
function DisplayDishDetail(mealData) {
    dishInfoEl.innerHTML='';
    
    dishinfo = document.createElement('div');

    const ingredients = [];

    for (let i = 1; i <= 20; i++)
    {
        if(mealData['strIngredient'+i]) {
            ingredients.push(`
            ${mealData['strIngredient'+i]}  
                / ${
                    mealData['strMeasure'+i]
                }`);
        } else {
            break;
        }
    }

    dishinfo.innerHTML=`
                <h1>${mealData.strMeal}</h1>
                <img src="${mealData.strMealThumb}" alt="">
            
                <p>${mealData.strInstructions}</p>
                <h3>Ingredients: </h3>
                <ul>
                    ${ ingredients
                        .map(
                            (ing) => `
                    <li> ${ing} </li> 
                    `
                        )
                        .join("")}
                </ul>
    `;
    dishInfoEl.appendChild(dishinfo);

    dishpopupEl.classList.remove('hidden');
}

// Event handlers

// event raised to search the dish
searchBtn.addEventListener("click", async () => {

    mealEl.innerHTML = '';

    const search = searchTerm.value;

    const searchMeal = await getMealsBySearch(search);

    if(searchMeal)
    {
        searchMeal.forEach((meal) => {
            loadRandomMeal(meal);
        });
    }   
});

dishpopupCloseBtn.addEventListener('click', () => {
    dishpopupEl.classList.add('hidden');
});
