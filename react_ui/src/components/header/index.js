import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Row, Col, Modal } from 'antd';
import { login, logout, signup, validateToken } from '../../factories/auth.js';
import LoginFormModal from './LoginFormModal';
import SignupFormModal from './SignupFormModal';

class Header extends Component {
  state = {
    current: 'home',
    signupModalVisible: false,
    loginModalVisible: false,
    logoutModalVisible: false,
    showLoginTab: false,
    showLogoutTab: false,
  };

  componentDidMount() {
    validateToken().then(() => {
      this.setState({
        showLoginTab: false,
        showLogoutTab: true,
      });
    }).fail(() => {
      this.setState({
        showLoginTab: true,
        showLogoutTab: false,
      });
    });
  }

  toggleNavItem = (e) => {
    this.setState({
      current: e.key,
    });
  };

  showSignupModal = () => {
    this.setState({
      signupModalVisible: true,
    });
  };

  showLoginModal = () => {
    this.setState({
      loginModalVisible: true,
    });
  };

  showLogoutModal = () => {
    const self = this;
    Modal.confirm({
      title: 'Confirm',
      content: 'Are you sure to log out?',
      onOk() {
        self.handleSubmitLogout();
      },
      onCancel() {
        self.handleCancelLogout();
      }
    });
  };

  resetSignupFields = () => {
    const form = this.signupForm;
    const resetFields = ['email', 'password', 'password_confirmation'];
    form.resetFields(resetFields);
  };

  handleSubmitSignup = () => {
    const form = this.signupForm;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      signup(values.email, values.password, values.password_confirmation)
        .then(() => {
          this.resetSignupFields();
          this.setState({
            signupModalVisible: false,
          });
          Modal.success({
            title: 'Sign Up Success!',
            content: 'Please activate your account in your email',
          });
        })
        .fail(res => {
          let errors = res.data.errors;
          for (let attr in errors) {
            form.setFields({
              [attr]: {
                value: res.data.data[attr],
                errors: [new Error(errors[attr][0])],
              }
            })
          }
        });
    });
  };

  handleCancelSignup = () => {
    this.resetSignupFields();
    this.setState({
      signupModalVisible: false,
    });
  };

  resetLoginFields = () => {
    const form = this.loginForm;
    const rememberEmail = form.getFieldValue('remember');
    let resetFields = ['password', 'formError'];
    if (!rememberEmail) {
      resetFields.push('email');
    }
    form.resetFields(resetFields);
  };

  handleSubmitLogin = () => {
    const form = this.loginForm;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      login(values.email, values.password)
        .then(() => {
          this.resetLoginFields();
          this.setState({
            loginModalVisible: false,
            showLoginTab: false,
            showLogoutTab: true,
          });
        })
        .fail(res => {
          form.setFields({
            formError: {
              value: '',
              errors: [new Error(res.data.errors[0])],
            },
          });
        });
    });
  };

  handleCancelLogin = () => {
    this.resetLoginFields();
    this.setState({
      loginModalVisible: false,
    });
  };

  handleSubmitLogout = () => {
  	logout().then(() => {
      this.setState({
        showLoginTab: true,
        showLogoutTab: false,
        logoutModalVisible: false,
      });
    });
  };

  handleCancelLogout = () => {
    this.setState({
      logoutModalVisible: false,
    });
  };

  saveLoginFormRef = (form) => {
    this.loginForm = form.props.form;
  };

  saveSignupFormRef = (form) => {
    this.signupForm = form.props.form;
  };

  render() {
    return (
    	<div>
				<Row>
					<Col span={8}><h1>Awesome Class</h1></Col>
					<Col span={16}>
						<Menu
							onClick={this.toggleNavItem}
							selectedKeys={[this.state.current]}
							mode="horizontal"
						>
							<Menu.Item key="home">
								<NavLink to="/">Home</NavLink>
							</Menu.Item>
              { this.state.showLoginTab ? (
                <Menu.Item key="signup">
                  <div onClick={this.showSignupModal}>Sign Up</div>
                </Menu.Item>
              ) : null }
              { this.state.showLoginTab ? (
                <Menu.Item key="login">
                  <div onClick={this.showLoginModal}>Log In</div>
                </Menu.Item>
              ) : null }
              { this.state.showLogoutTab ? (
                <Menu.Item key="logout">
                  <div onClick={this.showLogoutModal}>Log Out</div>
                </Menu.Item>
              ) : null }
						</Menu>
					</Col>
				</Row>
				<LoginFormModal
				  className="login-modal"
          wrappedComponentRef={this.saveLoginFormRef}
				  visible={this.state.loginModalVisible}
				  onSubmit={this.handleSubmitLogin}
          onCancel={this.handleCancelLogin}
				/>
        <SignupFormModal
          wrappedComponentRef={this.saveSignupFormRef}
          visible={this.state.signupModalVisible}
          onSubmit={this.handleSubmitSignup}
          onCancel={this.handleCancelSignup}
        />
			</div>
    );
  }
}

export default Header;
