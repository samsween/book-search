import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Alert
} from 'react-bootstrap';


import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import { QUERY_ME } from '../utils/queries';
import { useMutation, useQuery } from '@apollo/client';
import { REMOVE_BOOK } from '../utils/mutations';


const SavedBooks = () => {
  const [userData, setUserData] = useState({});
  const [showError, setShowError] = useState(false);
  const { loading } = useQuery(QUERY_ME, {
    onCompleted: (data) => {
      setUserData({...data.me});
    }
  });
  const [removeBook, {error}] = useMutation(REMOVE_BOOK)

  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    if (!token) {
      return false;
    }

    try {
      const deletedBook = await removeBook({
        variables: { bookId: bookId }
      });
      setUserData(deletedBook?.data.removeBook);
      // upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
      setShowError(true);
    }
  };

  // if data isn't here yet, say so
  if (loading) {
    return <h2>LOADING...</h2>;
  }
  if (!userData?.username) {
    return (
      <Container>
      <h1 className='text-center'>
        You need to be logged in to see this page. Use the navigation links above to sign up or log in!
      </h1>
    </Container>
    )
  }

  return (
    <>
      <div fluid="true" className='text-light bg-dark p-5'>
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </div>
      {showError || error && <Alert className='mt-5' variant='danger' dismissible >
         <Alert.Heading>Something went wrong!</Alert.Heading>
      </Alert>}
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book) => {
            return (
              <Col md="4" key={book.bookId}>
                <Card key={book.bookId} border='dark'>
                  {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
