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
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';

import axios from 'axios';
import store from "./redux/store";
import { connect } from "react-redux";
import Container from "react-bootstrap/Container"

import {MedImgProjects, MedImgViewer, MedImgStudy, MedImgSurf} from 'react-med-img';

import {Eye, EyeOff} from 'react-feather'

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
    return (
      <Container fluid="true">
        <Row>
          <Col sm={2}>
            <Accordion defaultActiveKey="0">
              <Card>
                <Card.Header>
                  <Accordion.Toggle as={Button} variant="primary" eventKey="0">
                    Series <Eye/>
                  </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="0" style={{maxHeight: "78vh", overflow: "scroll"}}>
                  <MedImgStudy/>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          </Col>
          <Col sm={10} style={{maxHeight: "78vh"}}>
            <MedImgViewer/>
          </Col>
        </Row>
      </Container>);
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
      <Container>
        <Row>
          <Col sm={8}>
            <MedImgSurf/>
          </Col>
          <Col sm={4}>
            <Card>
              <Card.Body>
                <Card.Title class='alert alert-primary'>HPC</Card.Title>
                <Card.Text>
                  We provide the resources for image storage, retrieval and high performance computing for your organization.
                </Card.Text>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                <Card.Title class='alert alert-primary'>Automated analysis</Card.Title>
                <Card.Text>
                  We provide several methods for image quality control, automated analysis and statistics. 
                </Card.Text>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                <Card.Title class='alert alert-primary'>AI</Card.Title>
                <Card.Text>
                  Anotate images/datasets, with our customized tools and use them to train state of the art artificial intelligence algorithms.
                </Card.Text>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                <Card.Title class='alert alert-primary'>Tools</Card.Title>
                <Card.Text>
                  Image visualization and edition, 3D object modeling and shape statistics.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>);
  }

  // <Col sm={8}>
  //           <Carousel>
  //             <Carousel.Item>
  //               <Image src="/images/icosahedron.png" fluid/>
  //               <Carousel.Caption>
  //                 <h3>3D modeling and visualization</h3>
  //               </Carousel.Caption>
  //             </Carousel.Item>
  //             <Carousel.Item>
  //               <Image src="/images/fibers.png" fluid/>
  //               <Carousel.Caption>
  //                 <h3>High performance computing</h3>
  //               </Carousel.Caption>
  //             </Carousel.Item>
  //             <Carousel.Item>
  //               <Image src="/images/segmentation.png" fluid/>
  //               <Carousel.Caption>
  //                 <h3>Automated image processing</h3>
  //               </Carousel.Caption>
  //             </Carousel.Item>
  //             <Carousel.Item>
  //               <Image src="/images/subcortical.png" fluid/>
  //               <Carousel.Caption>
  //                 <h3>Data storage and retrieval</h3>
  //               </Carousel.Caption>
  //             </Carousel.Item>
  //           </Carousel>
  //         </Col>

  render(){
    return (
      <div className="App">
        <HashRouter>
          <header className="App-header">
            <NavBar/>
          </header>
          <Container fluid="true" style={{height: "100%", minHeight: "85vh"}}>
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
                <a href="mailto:contact@medimg-ai.com">Contact us</a>
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