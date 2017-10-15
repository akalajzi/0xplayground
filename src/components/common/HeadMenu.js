import React, { Component } from 'react'
import { Toolbar, Button, MenuButton } from 'react-md';

export default class HeadMenu extends Component {
	render() {
		return (
			<Toolbar
				colored
				nav={<Button icon>menu</Button>}
				title="0xplorer"
				actions={<MenuButton
									id={'kebab-menu-toolbar'}
									icon
									menuItems={['Settings', 'Help']}
								>
									more_vert
								</MenuButton>
							}
			/>
		)
	}
}
