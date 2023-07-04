const User = require("./model")
const {hashData, verifyHashedData} = require("./../../util/hashData");
const createToken = require("./../../util/createToken")

const authenticateUser = async(data)=>{
    try {
        const {phone, password} = data;
        const fetchedUser = await User.findOne({phone});

        if(!fetchedUser){
            throw Error("Invalid phone number");
        }
        const hashedPassword = fetchedUser.password;
        const passwordMatch = await verifyHashedData(password, hashedPassword);

        if(!passwordMatch){
            throw Error("Invalid password");
        }
        // create uuser token
        const tokenData = {userId: fetchedUser._id, phone};
        const token = await createToken(tokenData);

        //assign user token
        fetchedUser.token = token;
        return fetchedUser;
    } catch (error) {
        throw error;
    }
}


const createNewUser = async(data)=>{
    try {
        const {name, phone, password} = data;
        // check if user already exists
        const existingUser = await User.findOne({phone});

        if(existingUser){
            throw Error("User with this phone number already exists")
        }

        //hash password
        const hashedPassword = await hashData(password);
        const newUser = new User({
            name,
            phone,
            password: hashedPassword,
        })

        //save the user
        const createdUser = await newUser.save();
        return createdUser;
    } catch (error) {
        throw error
    }
}

module.exports = {createNewUser, authenticateUser};
