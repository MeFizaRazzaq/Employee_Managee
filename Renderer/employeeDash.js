const username = document.getElementById('user');
const projects = document.getElementById('Projects');
const login    = document.getElementById('login');
const salary   = document.getElementById('salary');
const welcome  = document.getElementById('user2');
const addnotice = document.getElementById('addNotice');
const addpop = document.getElementById('addNoticePopup');
//addNoticePopup

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
function formatTimeInHHmmss(inputDate) {
    try {
        // Parse the input date string using the specified format
        const dateObject = new Date(inputDate);

        // Extract hours, minutes, and seconds from the date object
        const hours = dateObject.getHours();
        const minutes = dateObject.getMinutes();
        const seconds = dateObject.getSeconds();

        // Format the result in HH:MM:SS
        const result = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

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