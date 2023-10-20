const { User } = require('../models')
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        users: async () => {
            return User.find().populate('savedBooks')
        },
        me: async(parent, { username }) => {
            return User.findOne({ username }).populate('savedBooks');
        }
    },
    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
        
            if (!user) {
                throw AuthenticationError;
            }
        
            const correctPw = await user.isCorrectPassword(password);
        
            if (!correctPw) {
                throw AuthenticationError;
            }
        
            const token = signToken(user);
        
            return { token, user };
        },
        saveBook: async ( parent, { bookId, authors, title, description, image, link } , context ) => {
            if ( context.user) {
                return User.findByIdAndUpdate(
                    {_id: context.user.Id},
                    {
                        $addToSet: {
                            savedBooks: { bookId, authors, description, title, image, link }
                        }
                    },
                    { new:true }
                )
            }
            throw AuthenticationError
        },
        deleteBook: async ( parent, { bookId }, context ) => {
            if ( context.user ){
                return User.findByIdAndUpdate(
                    {_id: context.user.Id},
                    { $pull: {savedBooks:  bookId } },
                    { new: true }
                )
            }
            throw AuthenticationError
        }
    }
};

module.exports = resolvers;