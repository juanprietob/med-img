import React, { Component } from 'react';
import { Route, HashRouter } from 'react-router-dom';

import "./custom.scss"

import {JWTAuth, JWTAuthInterceptor, JWTAuthUsers, JWTAuthProfile, JWTAuthService} from 'react-jwt-auth';
import NavBar from './nav-bar'
import Carousel from 'react-bootstrap/Carousel';
import Image from 'react-bootstrap/Image'
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import CardColumns from 'react-bootstrap/CardColumns';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import axios from 'axios';
import store from "./redux/store";
import { connect } from "react-redux";
import Container from "react-bootstrap/Container"
import Alert from "react-bootstrap/Alert"

import {MedImgProjects, MedImgViewer, MedImgStudy, MedImgSurf} from 'react-med-img';

import {ArrowUp, ArrowDown} from 'react-feather'

class App extends Component {

  constructor(props){
    super(props);

    let http = axios;
    if(process.env.NODE_ENV === 'development'){
      http = axios.create({
        baseURL: 'http://localhost:8180'
      });
    }

    this.state = {
      user: {},
      showLogin: true
    }

    store.dispatch({
      type: 'http-factory',
      http: http
    });

    this.clusterpost = {};

    const self = this;

    const interceptor = new JWTAuthInterceptor();
    interceptor.setHttp(http);
    interceptor.update();
    
    const jwtauth = new JWTAuthService();
    jwtauth.setHttp(http);
    jwtauth.getUser()
    .then(function(user){
      self.setState({...self.state, user: user, showLogin: false});
      store.dispatch({
        type: 'user-factory', 
        user: user
      });
    });
  }

  componentWillReceiveProps(newProps){
     if(newProps.user != this.props.user){
         this.setState({user: newProps.user})
     }
     this.setState({showLogin: true});
  }

  handleHide(){
    this.setState({...this.state, showLogin: false});
  }

  login(){
    const {showLogin} = this.state;

    return (<Modal size="lg" show={showLogin} onHide={this.handleHide.bind(this)}>
              <div class="alert alert-info">
                <Modal.Header closeButton>
                  <Modal.Title>Please login</Modal.Title>
                </Modal.Header>
              </div>
              <Modal.Body><JWTAuth></JWTAuth></Modal.Body>
            </Modal>);
  }

  profile(){
    return (<div class="container">
        <div class="row justify-content-center">
          <div class="card col-8">
            <div class="card-body">
              <JWTAuthProfile></JWTAuthProfile>
            </div>
          </div>
        </div>
      </div>);
  }

  adminUsers(){
    return (<Container>
        <Row class="justify-content-center">
          <JWTAuthUsers></JWTAuthUsers>
        </Row>
      </Container>);
  }

  viewer(){

    const self = this;

    return (
      <Row>
        <Col sm={2} style={{padding: 0}}>
          <Accordion defaultActiveKey="0">
            <Card>
              <Card.Header>
                <Accordion.Toggle as={Button} variant="primary" eventKey="0">
                  <ArrowUp/><ArrowDown/>
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="0">
                <Card.Body style={{overflow: "scroll", maxHeight: "90vh"}}>
                  <MedImgStudy/>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          </Accordion>
        </Col>
        <Col sm={10} style={{padding: 0}}>
          <MedImgViewer maxHeight="85vh" maxWidth="85vh"/>
        </Col>
      </Row>);
  }

  home(){
    const {user} = this.state;
    return (
      <Container>
        
          <MedImgProjects/>
        
      </Container>);
  }

  welcome(){
    const {user} = this.state;
    return (
      <Container fluid="true">
        <Row>
          <Col sm={12}>
            <Alert variant="info">
              <Alert.Heading>Welcome to my personal web site!</Alert.Heading>
            </Alert>
          </Col>
        </Row>
        <Row>
          <Col sm={4}>
            <Card>
              <Card.Img variant="top" src="images/gwjpd.prietojuan.jpg"/>
              <Card.Header class='alert alert-primary'>PhD. Juan Carlos Prieto</Card.Header>
              <Card.Body>
                <Card.Text>
                  Here you will find some information about me and my personal interests in research.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={8}>
            <MedImgSurf/>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <Alert variant="info">
              <Alert.Heading>About me</Alert.Heading>
            </Alert>
          </Col>
        </Row>
        <Row>
          <CardColumns>
            <Card>
              <Card.Header class='alert alert-primary'>My work place</Card.Header>
              <Card.Body>
                <Card.Text>
                  I am doing research at the <a href="https://www.med.unc.edu/psych/directory/juan-prieto/">University of North Carolina</a>.
                </Card.Text>
              </Card.Body>
            </Card>
            <Card>
              <Card.Header class='alert alert-primary'>My CV</Card.Header>
              <Card.Body>
                <Card.Text>
                  You can download a pdf version of my CV with my publication list <a href="images/CV_PRIETO.pdf">here</a>. 
                </Card.Text>
              </Card.Body>
            </Card>
            <Card>
              <Card.Header class='alert alert-primary'>Brain connectivity research</Card.Header>
              <Card.Body>
                <Card.Text>
                  I am interested in developing methods to automatically classify fiber tracts produced by 
                  tractography algorithms. You can find a publication in this subject <a href="https://www.spiedigitallibrary.org/conference-proceedings-of-spie/10574/1057412/TRAFIC-fiber-tract-classification-using-deep-learning/10.1117/12.2293931.short?SSO=1" target="_blank">here</a>
                </Card.Text>
              </Card.Body>
            </Card>
            <Card>
              <Card.Header class='alert alert-primary'>Fetal age prediction</Card.Header>
              <Card.Body>
                <Card.Text>
                  I am also interested in developing methods to automatically classify and identify fetal biometry to predict gestational age in Ultrasound images.
                  This is an ongoing work and I will have a publication soon!
                </Card.Text>
              </Card.Body>
            </Card>
            <Card>
              <Card.Header class='alert alert-primary'>Dental and Craniofacial Bionetwork for Image Analysis.</Card.Header>
              <Card.Body>
                <Card.Text>
                  I have contributed to the development of cutting-edge image analysis tools for dental and craniofacial data sets.
                  You can find more information about this project <a href="http://cmf.slicer.org/about/">here</a>.
                </Card.Text>
              </Card.Body>
            </Card>
            <Card>
              <Card.Header class='alert alert-primary'>Software development</Card.Header>
              <Card.Body>
                <Card.Text>
                  This website is hosted in GCloud and I am using React for visualization and Hapi.js in the backend. 
                  The 3D visualization that you see on top uses VTK.js. If you create an account, you will have the possibility to visualize medical images
                  in an image viewer that uses ITK.js to load the images. 
                  I could host your dicom images and deploy trained models to do classification or any task that involves medical image processing. 
                  Contact me if you would like to know more!
                </Card.Text>
              </Card.Body>
            </Card>
          </CardColumns>
        </Row>
      </Container>);
  }

  render(){
    return (
      <div className="App">
        <HashRouter>
          <header className="App-header">
            <NavBar/>
          </header>
          <Container fluid="true" style={{height: "100%", minHeight: "90vh"}}>
            <Route path="/login" component={this.login.bind(this)}/>
            <Route path="/logout" component={this.login.bind(this)}/>
            <Route path="/user" component={this.profile.bind(this)}/>
            <Route path="/admin/users" component={this.adminUsers.bind(this)}/>
            <Route path="/home" component={this.home.bind(this)}/>
            <Route path="/viewer" component={this.viewer.bind(this)}/>
            <Route exact path="/" component={this.welcome.bind(this)}/>
          </Container>
          <footer class="alert alert-dark" style={{fontSize: "small", width: "100%"}}>
            <Row className="justify-content-md-center">
              <Col md="auto">
                <a href="mailto:contact@medimg-ai.com">Contact me</a>
              </Col>
            </Row>
            <Row className="justify-content-md-center">
              <Col md="auto">
                Copyright &copy; 2019 - Juan Carlos Prieto
              </Col>
            </Row>
          </footer>
        </HashRouter>
      </div>
    );
  }
  
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.jwtAuthReducer.user,
    showLogin: state.navbarReducer.showLogin
  }
}

export default connect(mapStateToProps)(App);