function init() {
    //whole lotta consts
    const overlay = document.getElementById("overlay");
    const careerTitle = document.getElementById("occupation");
    const calculator = document.getElementById("main-content");
    const inputs = document.querySelectorAll(".expense");
    const canvas = document.getElementById("myChart");
    const nextButton = document.querySelectorAll('.next');
    const backButton = document.querySelectorAll('.back');
    const steps = document.querySelectorAll("#steps a"); // Select all step circles
    const content = document.querySelectorAll(".step-content"); // Select all content sections
    const careerOverlay = document.getElementById('select-career');
    const closeOverlay = document.getElementById('career-close');
    const searchFilter = document.getElementById("searchFilter");


    //navigation for sections
    let currentStep = 0;

    function updateStep(stepNumber) {
        steps.forEach((circle, circleNumber) => {
            if (circleNumber <= stepNumber) {
                circle.classList.add("active");
            }
            else {
                circle.classList.remove("active");
            }

            if (stepNumber == 6){
                circle.classList.remove("active");
                circle.classList.add("complete");
            } else {
                circle.classList.remove("complete")
            }
        })

        // add logic to hide / reveal elements based on the step
        content.forEach((section, i) => {
            if (i === stepNumber) {
                section.classList.add("active");
            } else {
                section.classList.remove("active");
            }
        });
    }

    steps.forEach((step, index) => {
        step.addEventListener("click", (i) => {
            i.preventDefault(); // Prevent default anchor behavior
            currentStep = index;
            updateStep(currentStep);
        });
    });


    //listeners for next and back buttons
    nextButton.forEach(button => {
        button.addEventListener('click', () => {
            currentStep++;
            updateStep(currentStep);
        });
    });

    backButton.forEach(button => {
        button.addEventListener('click', () => {
            currentStep--;
            updateStep(currentStep);
        });
    });


    //creating buttons for career select overlay & adding necessary information
    function createButtons(careers) {
        careers.forEach((career, index) => {
            const button = document.createElement("button");
            const actualOverlay = document.getElementById("overlay-content"); //accessing

            button.innerHTML = `${career.Occupation}: ${career.Salary.toLocaleString("en-US", { style: "currency", currency: "USD" })}`; //adding HTML of button

            button.setAttribute("id", `${index}`); //adding id, data, and class attributes
            button.setAttribute("data-career", `${career.Occupation.replaceAll(' ', '')}`);
            button.classList.add("careerButton");

            button.addEventListener("click", () => { //adding event listener to change HTML
                let savedChoice = {};
                savedChoice["choice"] = career.Occupation;
                savedChoice["income"] = career.Salary;
                localStorage.setItem("savedChoice", JSON.stringify(savedChoice)); //saving choice

                careerTitle.innerHTML = `${career.Occupation}`;
                updateIncome(career.Salary); //changing HTML
                calcSaveChart(); //run totals and math

                //removing classes from HTML elements to close overlay
                overlay.classList.remove('active');
                overlay.classList.add('notActive');
                document.body.classList.remove('overlayOpen');
            });

            actualOverlay.appendChild(button);//add button to overlay
        });
    }

    function updateIncome(income){
        document.getElementById("income-amount").innerHTML = `${Math.round(tax(income) / 12).toLocaleString("en-US", { style: "currency", currency: "USD" })}`;
        document.getElementById("salary").innerHTML = `${income.toLocaleString("en-US", { style: "currency", currency: "USD" })}`;
        document.getElementById("net-annual-salary").innerHTML = `${tax(income).toLocaleString("en-US", { style: "currency", currency: "USD" })}`;
        document.getElementById("net-monthly-salary").innerHTML = `${Math.round(tax(income) / 12).toLocaleString("en-US", { style: "currency", currency: "USD" })}`;

        //tax information overlay
        document.getElementById("pre-tax").innerHTML = `${income.toLocaleString("en-US", { style: "currency", currency: "USD" })}`;
        document.getElementById("state-tax").innerHTML = `-${(income * .04).toLocaleString("en-US", { style: "currency", currency: "USD" })}`;
        document.getElementById("social-tax").innerHTML = `-${(income * .062).toLocaleString("en-US", { style: "currency", currency: "USD" })}`;
        document.getElementById("med-tax").innerHTML = `-${(income * .0145).toLocaleString("en-US", { style: "currency", currency: "USD" })}`;
        document.getElementById("tax-remainder").innerHTML = `${Math.round(tax(income)).toLocaleString("en-US", { style: "currency", currency: "USD" })}`;

        if (income < 16100) {
            document.getElementById("prog-tax").innerHTML = `-${(0).toLocaleString("en-US", { style: "currency", currency: "USD" })}`;
        } else if (income<= 28500) {
            document.getElementById("prog-tax").innerHTML = `-${((income - 16100) * 0.1).toLocaleString("en-US", { style: "currency", currency: "USD" })}`;
        } else if (income <= 66500) {
            document.getElementById("prog-tax").innerHTML = `-${((12400 * 0.1) + (income - 28500) * 0.12).toLocaleString("en-US", { style: "currency", currency: "USD" })}`;
        } else {
            document.getElementById("prog-tax").innerHTML = `-${((12400 * 0.1) + (38000 * 0.12) + (income - 66500) * 0.22).toLocaleString("en-US", { style: "currency", currency: "USD" })}`;
        }
    }

    async function getCareers() {
        const url = "https://eecu-data-server.vercel.app/data";
        try {
            const response = await fetch(url); //grab array string
            const jobs = await response.json(); //convert into actual array
            createButtons(jobs); //use array to make overlay buttons
            return jobs; //return actual array
        }
        catch (error) {
            console.error("Error fetching careers data:", error);
            return [];
        }
    }


    let currentChart = new Chart(canvas, //creating chart
        {
            type: "doughnut",
            data: {
                labels: ["Housing", "Loans", "Essentials", "Lifestyle", "Future Planning"],
                datasets: [{ label: "$", data: [0, 0, 0, 0, 0],
                    backgroundColor: [
                        '#FF6384', 
                        '#36A2EB', 
                        '#FFCE56', 
                        '#4BC0C0', 
                        '#9966FF'  
                        ]
                 }]
            },
            options: {
                plugins: {
                    title: { display: false },
                    legend: {display: false}
                }
            }
        }
    )

    const chartColors = currentChart.data.datasets[0].backgroundColor; //accessing backgroud color from chart
    const colorCircles = document.querySelectorAll("#expense-percentages .circle-color"); //grabbing all spans b4 <p>'s

    colorCircles.forEach((circle, index) => { //every span gets dedicated color
        circle.style.backgroundColor = chartColors[index]; 
    });


    getCareers(); //fetch career array
    save(); //update screen



/* Overlay Settings RIGHT HERE */

    careerOverlay.addEventListener ('click', ()=> {
        overlay.classList.remove('notActive');
        overlay.classList.add('active');
        document.body.classList.add('overlayOpen');
    }) 

    closeOverlay.addEventListener ('click', ()=> {
        overlay.classList.remove('active');
        overlay.classList.add('notActive');
        document.body.classList.remove('overlayOpen');
    }) 

    document.getElementById("tax-info").addEventListener("click", () => {
        document.body.classList.add('overlayOpen');
        document.getElementById("tax-overlay").classList.remove('notActiveTax');
        document.getElementById("tax-overlay").classList.add('activeTax');
    })

    document.getElementById("tax-close").addEventListener("click", () => {
        document.body.classList.remove('overlayOpen');
        document.getElementById("tax-overlay").classList.remove('activeTax');
        document.getElementById("tax-overlay").classList.add('notActiveTax');
    })



    //tax function
    function tax(grossIncome) {
        let netIncome = 0;
        if (grossIncome < 16100) { netIncome = grossIncome }
        else if (grossIncome<= 28500) { netIncome = 16100 + (grossIncome - 16100) * 0.90; }
        else if (grossIncome <= 66500) { netIncome = 27260 + (grossIncome - 28500) * 0.88; }
        else { netIncome = 60700 + (grossIncome - 66500) * 0.78; }
        netIncome -= grossIncome * 0.04;
        netIncome -= grossIncome * 0.062;
        netIncome -= grossIncome * 0.0125;
        return Math.round(netIncome);
    }


    //calculating totals, saving to local storage, updating chart
    function calcSaveChart() {
        const savedExpenses = {};
        let housing = 0, life = 0, essentials = 0, loans = 0, future = 0, total = 0;

        const pullCareer = JSON.parse(localStorage.getItem("savedChoice")) || 0; //pulling career income
        const careerIncome = pullCareer["income"] || 0;
        
        inputs.forEach(input => {
            total += Number(input.value.replace(/[^0-9]/g, '')) || 0; //adding total

            savedExpenses[input.id] = Number(input.value.replace(/[^0-9]/g, '')) || 0; //adding expense to array to save

            if (input.classList.contains("housing")) { //checks which category input belongs to & adds only the integers
                housing += Number(input.value.replace(/[^0-9]/g, '')) || 0;
            }
            else if (input.classList.contains("lifestyle")) {
                life += Number(input.value.replace(/[^0-9]/g, '')) || 0;
            }
            else if (input.classList.contains("essentials")) {
                essentials += Number(input.value.replace(/[^0-9]/g, '')) || 0;
            }
            else if (input.classList.contains("loans")) {
                loans += Number(input.value.replace(/[^0-9]/g, '')) || 0;
            }
            else if (input.classList.contains("future")) {
                future += Number(input.value.replace(/[^0-9]/g, '')) || 0;
            }
        });

        document.getElementById("expense-amount").innerHTML = `-${total.toLocaleString("en-US", { style: "currency", currency: "USD" })}`; //updating expense HTML

        if (Math.round(tax(careerIncome) / 12 - total < 0)){
            document.getElementById("remainder-amount").style.color = 'red';
            document.getElementById("remainder-amount").innerHTML = `${Math.round(tax(careerIncome) / 12 - total).toLocaleString("en-US", { style: "currency", currency: "USD" })}`;
        }else {
            document.getElementById("remainder-amount").style.color = 'var(--complete-green)';
            document.getElementById("remainder-amount").innerHTML = `+${Math.round(tax(careerIncome) / 12 - total).toLocaleString("en-US", { style: "currency", currency: "USD" })}`;

        }

        localStorage.setItem("savedExpenses", JSON.stringify(savedExpenses)); //saving

        if (currentChart) currentChart.destroy();
        currentChart = new Chart(canvas, //new chart
            {
                type: "doughnut",
                data: {
                    labels: ["Housing", "Loans", "Essentials", "Lifestyle", "Future Planning"],
                    datasets: [{ label: "$ (USD)", data: [housing, loans, essentials, life, future],
                    backgroundColor: [
                        '#FF6384', 
                        '#36A2EB', 
                        '#FFCE56', 
                        '#4BC0C0', 
                        '#9966FF'  
                        ]
                     }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: { display: false },
                        legend: {display: false }
                    }
                }
            }
        )

        //updating HTML percentages
        document.querySelector("#house-percent").innerHTML = `${total === 0 ? 0 : Math.round((10000 * housing / total)) / 100}%`;
        document.querySelector("#loan-percent").innerHTML = `${total === 0 ? 0 : Math.round((10000 * loans / total)) / 100}%`;
        document.querySelector("#essential-percent").innerHTML = `${total === 0 ? 0 : Math.round((10000 * essentials / total)) / 100}%`;
        document.querySelector("#life-percent").innerHTML = `${total === 0 ? 0 : Math.round((10000 * life / total)) / 100}%`;
        document.querySelector("#future-percent").innerHTML = `${total === 0 ? 0 : Math.round((10000 * future / total)) / 100}%`;

        //updating results screen based off remainder and savings
        if (Math.round((10000 * future / total)) / 100 > 10 && total <= Math.round(tax(careerIncome) / 12)){
            document.getElementById("outcome-header").innerHTML = "Congratulations!";
            document.getElementById("outcome").innerHTML = `It seems like you're within budget! You won't go into debt! If you have any money left over, you should dedicate it to your savings. A rule to go by is to save at least 10% of your monthly income, and it seems like you're saving ${Math.round((10000 * future / total)) / 100}%! Phenomenal! You will be financially stable in the future! Stand proud, you're not broke.`;
        } else if (Math.round((10000 * future / total)) / 100 <= 10 && total < Math.round(tax(careerIncome) / 12)){
            document.getElementById("outcome-header").innerHTML = "Hmmm...Almost There!";
            document.getElementById("outcome").innerHTML = `It seems like you're within budget! Essentially, you won't go into debt! If you have any money left over, you should dedicate it to your savings. A rule to go by is to save at least 10% of your monthly income. It seems like you're saving ${Math.round((10000 * future / total)) / 100}% of your income; you're almost there! Feel free to go back and edit your budget!`;
        } else {
            document.getElementById("outcome-header").innerHTML = "Uh Oh!";
            document.getElementById("outcome").innerHTML = `It seems like you're over budget! Falling into debt is very dangerous, and it is best to avoid it as much as possible. In order to cut down your costs, reevaluate some of your expenses. Try and remove as many expenses that aren't strictly necessary such as dining out or streaming services. Feel free to go back and change your budget.`;
        }
    }

    function save() {
        const pullExpenses = JSON.parse(localStorage.getItem("savedExpenses")); //grabbing array
        inputs.forEach(input => { //updating input fields with previous numbers
            if (pullExpenses) {
                if (pullExpenses[input.id]) {
                    input.value = pullExpenses[input.id]
                }
            }
        })

        const pullCareer = JSON.parse(localStorage.getItem("savedChoice"));
            if (pullCareer && pullCareer["choice"]) {
                careerTitle.innerHTML = `${pullCareer["choice"]}`;
                updateIncome(pullCareer["income"]);
            } else {
                careerTitle.innerHTML = '';
            }

        calcSaveChart(); //update page
    }

    calculator.addEventListener("input", () => { //any input for text box updates totals, storage, and chart
        calcSaveChart();
    })


    //search filter for overlay buttons
    searchFilter.addEventListener("input", ()=>{
        const careerOptions = document.querySelectorAll('[data-career]'); //accessing data-career attribute
        let filter = searchFilter.value.toLowerCase(); //grab input & to lowercase

        careerOptions.forEach((careerBtn) =>{
            const careerContent = careerBtn.dataset.career.toLowerCase(); //grabbing attribute content

            if (filter != "" && !careerContent.includes(`${filter}`)){ //if input not empty and attribute doesn't have input, hide
                careerBtn.classList.add("hidden");
            } else {
                careerBtn.classList.remove("hidden"); //else, shown
            }
        })
    })

    
}





// initialize the app when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", init);