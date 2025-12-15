/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import { Empty, Result, Skeleton } from 'antd';
import getConfig from 'next/config';
import localRooms from '../data/rooms';
import Link from 'next/link';
import React from 'react';
import Banner from '../components/home/Banner';
import FeaturedRooms from '../components/home/FeaturedRooms';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import MainLayout from '../components/layout';

const { publicRuntimeConfig } = getConfig();

function Home(props) {
  return (
    <MainLayout title='Beach Resort ― Home'>
      <Hero>
        <Banner
          title='luxurious rooms'
          subtitle='deluxe rooms starting at $299'
        >
          <Link href='/rooms' className='btn-primary'>
            our rooms
          </Link>
        </Banner>
      </Hero>
      <Services />

      {/* featured rooms */}
      <Skeleton loading={!props?.featuredRooms && !props?.error} paragraph={{ rows: 5 }} active>
        {props?.featuredRooms?.data?.rows?.length === 0 ? (
          <Empty
            className='mt-10'
            description={(<span>Sorry! Any data was not found.</span>)}
          />
        ) : props?.error ? (
          <Result
            title='Failed to fetch'
            subTitle={props?.error?.message || 'Sorry! Something went wrong. App server error'}
            status='error'
          />
        ) : (
          <FeaturedRooms
            featuredRoom={props?.featuredRooms?.data?.rows}
          />
        )}
      </Skeleton>
    </MainLayout>
  );
}

export async function getServerSideProps() {
  // When API base URL exists, keep SSR fetching; otherwise generate from local data
  if (publicRuntimeConfig?.API_BASE_URL) {
    return { props: { featuredRooms: null, error: { message: 'Backend required. Remove API_BASE_URL for demo.' } } };
  }

  const rows = localRooms
    .filter((r) => r?.fields?.featured)
    .map((r) => ({
      id: r.sys.id,
      room_name: r.fields.name,
      room_slug: r.fields.slug,
      room_type: r.fields.type,
      room_price: r.fields.price,
      room_size: r.fields.size,
      room_capacity: r.fields.capacity,
      allow_pets: r.fields.pets,
      provide_breakfast: r.fields.breakfast,
      room_description: r.fields.description,
      room_images: (r.fields.images || []).map((img) => ({ url: img?.fields?.file?.url }))
    }));

  return {
    props: {
      featuredRooms: { data: { rows } },
      error: null
    }
  };
}

export default Home;
