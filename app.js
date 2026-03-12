function init() {
    const overlay = document.getElementById("overlay");
    const careerTitle = document.getElementById("occupation");
    const calculator = document.getElementById("main-content");
    const inputs = document.querySelectorAll(".expense");
    const canvas = document.getElementById("myChart");
    let currentStep = 0;
    const nextButton = document.querySelectorAll('.next');
    const backButton = document.querySelectorAll('.back');
    const steps = document.querySelectorAll("#steps a"); // Select all step circles
    const content = document.querySelectorAll(".step-content"); // Select all content sections
    const careerOverlay = document.getElementById('select-career');
    const closeOverlay = document.getElementById('closeOverlay');
    const searchFilter = document.getElementById("searchFilter");

    function updateStep(stepNumber) {
        steps.forEach((circle, circleNumber) => {
            if (circleNumber <= stepNumber) {
                circle.classList.add("active");
            }
            else {
                circle.classList.remove("active");
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

    function createButtons(careers) {
        careers.forEach((career, index) => {
            const button = document.createElement("button");
            const actualOverlay = document.getElementById("overlay-content");

            button.innerHTML = `${career.Occupation}: ${career.Salary}`;
            button.setAttribute("id", `${index}`);
            button.setAttribute("data-career", `${career.Occupation.replaceAll(' ', '')}`);
            button.classList.add("careerButton")
            button.addEventListener("click", () => {
                careerTitle.innerHTML = `Future Career: ${career.Occupation}`;
                console.log(`Selected Career: ${career.Occupation}, Salary: ${career.Salary}`);

                const overlay = document.getElementById('overlay');
                overlay.classList.remove('active');
                overlay.classList.add('notActive');
                document.body.classList.remove('overlayOpen');
            });
            actualOverlay.appendChild(button);
        });
    }

    async function getCareers() {
        const url = "https://eecu-data-server.vercel.app/data";
        try {
            const response = await fetch(url);
            const jobs = await response.json();
            createButtons(jobs);
            return jobs;
        }
        catch (error) {
            console.error("Error fetching careers data:", error);
            return [];
        }

    }


    let currentChart = new Chart(canvas,
        {
            type: "doughnut",
            data: {
                labels: ["Housing (%)", "Loans (%)", "Essentials", "Lifestyle", "Future Planning"],
                datasets: [{ label: "$", data: [0, 1] }]
            },
            options: {
                plugins: {
                    title: { display: true, text: `Expenses by Catagory` }
                }
            }
        }
    )
    getCareers();
    save();



/* Overlay Settings RIGHT HERE */

    careerOverlay.addEventListener ('click', ()=> {
        const overlay = document.getElementById('overlay'); 
        overlay.classList.remove('notActive');
        overlay.classList.add('active');
        document.body.classList.add('overlayOpen');
    }) 

    closeOverlay.addEventListener ('click', ()=> {
        const overlay = document.getElementById('overlay');
        overlay.classList.remove('active');
        overlay.classList.add('notActive');
        document.body.classList.remove('overlayOpen');
    }) 

    function tax(grossIncome) {
        let netIncome = 0;
        if (grossIncome < 16100) { netIncome = grossIncome }
        else if (grossIncome<= 28500) { netIncome = 16100 + (grossIncome - 16100) * 0.90; }
        else if (grossIncome <= 66500) { netIncome = 27260 + (grossIncome - 28500) * 0.88; }
        else { netIncome = 60700 + (grossIncome - 66500) * 0.78; }
        netIncome -= grossIncome * 0.04;
        netIncome -= grossIncome * 0.062;
        netIncome -= grossIncome * 0.0125;
        return Math.roud(netIncome);

    }

    // this codes needs to be configured for Rey's prject, but it is a good starting point for the step navigation functionality
    steps.forEach((step, index) => {
        step.addEventListener("click", (i) => {
            i.preventDefault(); // Prevent default anchor behavior
            currentStep = index;
            updateStep(currentStep);
        });
    });
    function calcSaveChart() {
        const savedExpenses = {};
        let housing = 0;
        let life = 0;
        let essentials = 0;
        let loans = 0;
        let future = 0;

        let total = 0;
        inputs.forEach(input => {
            total += Number(input.value.replace(/[^0-9]/g, '')) || 0;
            savedExpenses[input.id] = Number(input.value.replace(/[^0-9]/g, '')) || 0;
            if (input.classList.contains("housing")) {
                housing += Number(input.value.replace(/[^0-9]/g, '')) || 0;
            }
            else if (input.classList.contains("life")) {
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
        localStorage.setItem("savedExpenses", JSON.stringify(savedExpenses));
        if (currentChart) currentChart.destroy();
        currentChart = new Chart(canvas,
            {
                type: "doughnut",
                data: {
                    labels: ["Housing (%)", "Loans (%)", "Essentials", "Lifestyle", "Future Planning"],
                    datasets: [{ label: "$", data: [housing, loans, essentials, life, future] }]
                },
                options: {
                    plugins: {
                        title: { display: true, text: `Expenses by Catagory` }
                    }
                }
            }
        )
    }
    function save() {
        const pullExpenses = JSON.parse(localStorage.getItem("savedExpenses"));
        inputs.forEach(input => {
            if (pullExpenses) {
                if (pullExpenses[input.id]) {
                    input.value = pullExpenses[input.id]
                }
            }
            calcSaveChart();
        })
    }
    calculator.addEventListener("input", () => {
        calcSaveChart();
        console.log("Hello World");

    })

    searchFilter.addEventListener("input", ()=>{
        const careerOptions = document.querySelectorAll('[data-career]');
        let filter = searchFilter.value.toLowerCase();

        careerOptions.forEach((careerBtn) =>{
            const careerContent = careerBtn.dataset.career.toLowerCase();
            if (filter != "" && !careerContent.includes(`${filter}`)){
                careerBtn.classList.add("hidden");
            } else {
                careerBtn.classList.remove("hidden");
            }
        })
    })
}





// initialize the app when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", init);