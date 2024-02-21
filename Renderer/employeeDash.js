const username = document.getElementById('user');
const projects = document.getElementById('Projects');
const login    = document.getElementById('login');
const salary   = document.getElementById('salary');
const welcome  = document.getElementById('user2');
const addnotice = document.getElementById('addNotice');
const addpop = document.getElementById('addNoticePopup');
const nBoard =  document.getElementById('noticeBoard');
//noticeBoard

fetchEmp().then((d)=>{
    username.innerText= d.firstName +" " +d.lastName;
    welcome.innerText= "Welcome "+d.firstName +" " +d.lastName+ "!";
    salary.innerText= "Rs."+d.SalaryAmount ;
    login.innerText= formatTimeInHHmmss(d.Login_Time);   
    projects.innerText= "To be developed" ;
    
}).catch((error) => {
console.error("Error fetching ID:", error);
}); 

//access logout button
const logoutbtn=document.getElementById("logOut");
logoutbtn.addEventListener('click',async()=>{
    try {
        validate.logOut();
    } catch (error) {
        console.error('Error in logout:', error);
    }
});

//add a notice
addnotice.addEventListener('click',function(e) {
    e.preventDefault(); // Prevent the default link behavior
    addpop.style.display = 'grid';
    //form submittion
    addbtn.addEventListener('click',function(e){
        e.preventDefault();
        // Get all the form input elements
        const form = document.getElementById('noticeForm');
        const formData = new FormData(form);

        // Convert FormData to a plain object
        const data = {};
        for (let [key, value] of formData.entries()) {
            
        console.log("d in js:",key,value);
            if(key=="DOB"){
                var formattedDateTime = new Date(value).toISOString().slice(0, 19).replace("T", " ") + ".000";
                data[key] = formattedDateTime;
            }else{
                data[key] = value;
            }
            
        }
        addNotice(data);

});
});
// Close the popup when the close button is clicked
closePopup.addEventListener('click', function() {
    addpop.style.display = 'none';
});

getNotice().then((d)=>{
    console.log("d:",d);
    for(let i=0;i<d.length;i++){
        const Ndiv= createTransferHtml(d[i]);
        nBoard.appendChild(Ndiv);
    }  
}).catch((error) => {
console.error("Error fetching ID:", error);
}); 


// Function to get new  emp screen from the main process
async function fetchEmp() {
    try {
        const data = await EmployeeeScreen.userinfo();
        const emp=data[0];
        console.log("emp:",emp);    
        return emp;
    } catch (error) {
        console.error('Error fetching data from main process:', error);
    }
}
///time conversion format
function formatTimeInHHmmss(inputDate, isGMT = true) {
    try {
        // Parse the input date string using the specified format
        const dateObject = isGMT ? new Date(inputDate + ' GMT+0000') : new Date(inputDate);

        // Extract hours, minutes, and seconds from the date object
        const hours = dateObject.getUTCHours()+ (isGMT ? 8 : 0);
        const minutes = dateObject.getUTCMinutes();
        const seconds = dateObject.getUTCSeconds();

        // Format the result in HH:MM:SS
        const result = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        //console.log("date result1:", result);
        return result;
    } catch (error) {
        return "Invalid date or format";
    }
}

//add a notice
async function addNotice(n){
    try {
        EmployeeeScreen.notice(n);
        return 0;
    } catch (error) {
        console.error('Error in notice js :', error);
    }
}

//get notice
async function getNotice(){
    try {
        const data = await EmployeeeScreen.getNotices();
        console.log("notice:",data);    
        return data;
    } catch (error) {
        console.error('Error fetching data from nmotice process:', error);
    }
}

function createTransferHtml(d) {
    // Create the outer div with class "transfer"
    const transferDiv = document.createElement('div');
    transferDiv.classList.add('transfer');

    // Create the div with class "transfer-logo" and the image element
    const logoDiv = document.createElement('div');
    logoDiv.classList.add('transfer-logo');
    const logoImg = document.createElement('img');
    logoImg.src = '../Assets/Screenshot 2023-12-11 213210.png';
    logoImg.alt = '';

    // Append the image to the logo div
    logoDiv.appendChild(logoImg);

    // Create the dl element with class "transfer-details"
    const detailsDL = document.createElement('dl');
    detailsDL.classList.add('transfer-details');

    // Create the div for the dt and dd elements
    const detailsDiv = document.createElement('div');

    // Create the dt element and set its text content
    const dtElement = document.createElement('dt');
    dtElement.textContent = d.firstName + " " + d.lastName;

    // Create the dd element and set its text content
    const ddElement = document.createElement('dd');
    ddElement.textContent = d.Note;

    // Append the dt and dd elements to the details div
    detailsDiv.appendChild(dtElement);
    detailsDiv.appendChild(ddElement);

    // Append the logo div and details div to the transfer div
    transferDiv.appendChild(logoDiv);
    detailsDL.appendChild(detailsDiv);
    transferDiv.appendChild(detailsDL);

    return transferDiv;
}

