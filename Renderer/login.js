const val=document.getElementById('valbtn');

val.addEventListener('click',async()=> {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try{
        console.log("Event listner:",username,password);
        validateUser(username,password);
    }catch(err){
        console.error('Error during login:', err);
        alertError("Undefine Error during LogIn");
    }
});


async function validateUser(u,p) {
    try {
        const response=await validate.authenticateUser(u, p);
        return response;
    } catch (error) {
        console.error('Error in validate process:', error);
    }
}
