import React from 'react';
import Header from './Header';

export default function Layout(props) {

	return (
		<div>
			<Header />
			<main style={{ minHeight: "80vh" }}>{props.children}</main>
		</div>
	)
}